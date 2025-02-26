"""
    This is a new script that has the functionality of selecting the desired output style(csv/json/text)
    The desired parsing style i.e group by col/row
    Would also display each page result of bounding boxes
"""
import os
import cv2
import json
import numpy as np
import pandas as pd
import shutil
import argparse
from PIL import Image
from paddleocr import PaddleOCR
from dataclasses import dataclass
from typing import List, Tuple
from PDFSNIPPER import split_pdf, save_pages_as_images

''' -------------------- Only for Windows If Poppler not on PATH --------------------
                         Set the path to the poppler binaries

=> INITIALLY COMMENTED OUT, IF WINDOWS USER CHECK THE REPO FOR DETAILS IF RUNTIME ERROR ENCOUNTERED
'''
os.environ['PATH'] += os.pathsep + r'C:\Program Files\Release-24.08.0-0\poppler-24.08.0\Library\bin' 

def image_to_pdf(image_path, pdf_path):
    try:
        image = Image.open(image_path)
        image.save(pdf_path, "PDF", resolution=100.0)  # Adjust resolution if needed
        print(f"Successfully converted '{image_path}' to '{pdf_path}'")
    except FileNotFoundError:
        print(f"Error: Image file not found at '{image_path}'")
    except Exception as e:
        print(f"An error occurred: {e}")


def convert_images_in_folder(input_folder, output_folder):
    """Converts all images in a folder to PDF files."""
    os.makedirs(output_folder, exist_ok=True)
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
          image_path = os.path.join(input_folder, filename)
          pdf_filename = os.path.splitext(filename)[0] + ".pdf"
          pdf_path = os.path.join(output_folder, pdf_filename)
          image_to_pdf(image_path, pdf_path)

# -------------------- Singleton OCR Class --------------------
class OCRSingleton:
    _instance = None
    def __new__(cls, lang: str = "en"):
        if cls._instance is None:
            print("Initializing OCR Model...")
            cls._instance = super(OCRSingleton, cls).__new__(cls)
            cls._instance.ocr = PaddleOCR(use_angle_cls=True, lang=lang) # Use the lang parameter passed in the function call
        return cls._instance

# -------------------- Dataclass for Temporary File Paths --------------------
@dataclass
class DEFAULT:
  """
    Stores the paths of the intermediate folders that are created while
    running the script.
  """
  single_page_pdf: str = "single_page_pdf"
  input_reports: str = "input_reports"
  output_reports: str = "output_reports"
  input: str = "input"

# -------------------- Dataclass for OCR Results --------------------
@dataclass
class OCRResult:
    text: str
    bbox: Tuple[int, int, int, int]  # (x_min, y_min, x_max, y_max)

# -------------------- Utility Class --------------------
class FileHandler:
    @staticmethod
    def get_images_from_folder(input_folder: str) -> List[str]:
        valid_extensions = (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".gif")
        return [
            os.path.join(input_folder, f)
            for f in os.listdir(input_folder)
            if f.lower().endswith(valid_extensions)
        ]
    @staticmethod
    def delete_folder_securely(folder_path: str):
        """Securely deletes all files and subfolders within a folder."""
        try:
            if not os.path.exists(folder_path):
                print(f"Folder '{folder_path}' does not exist.")
                return

            for root, dirs, files in os.walk(folder_path, topdown=False):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        os.remove(file_path)
                        print(f"Deleted file: {file_path}")
                    except Exception as e:
                        print(f"Error deleting file {file_path}: {e}")

                for dir in dirs:
                    dir_path = os.path.join(root, dir)
                    try:
                        shutil.rmtree(dir_path)
                        print(f"Deleted subfolder: {dir_path}")
                    except Exception as e:
                        print(f"Error deleting subfolder {dir_path}: {e}")

            os.rmdir(folder_path)
            print(f"Deleted folder: {folder_path}")
        except Exception as e:
            print(f"Unexpected error while deleting folder: {e}")

    @staticmethod
    def clean_text(text: str) -> str:
        return text.strip().replace("\n", " ").replace("  ", " ")

    @staticmethod
    def save_to_csv(data: List[List[str]], output_folder: str, filename: str, clean_text=False):
        os.makedirs(output_folder, exist_ok=True)
        df = pd.DataFrame(data)
        df.to_csv(os.path.join(output_folder, f"{filename}.csv"), index=False, encoding="utf-8-sig")

    @staticmethod
    def save_to_json(data: List[List[str]], output_folder: str, filename: str, clean_text=False):
        os.makedirs(output_folder, exist_ok=True)
        with open(os.path.join(output_folder, f"{filename}.json"), "w", encoding="utf-8") as f:
            if clean_text:
                merged_text = " ".join([" ".join(sublist) for sublist in data])  
                cleaned_text = FileHandler.clean_text(merged_text)  
                json.dump({"data": [cleaned_text]}, f, indent=4, ensure_ascii=False)  
            else:
                json.dump(data, f, indent=4, ensure_ascii=False)
    
    @staticmethod
    def save_to_text(data: List[List[str]], output_folder: str, filename: str, clean_text=False):
        os.makedirs(output_folder, exist_ok=True)
        with open(os.path.join(output_folder, f"{filename}.txt"), "w", encoding="utf-8") as f:
            for sublist in data:
                if clean_text:
                    sublist = [FileHandler.clean_text(text) for text in sublist]
                    f.write(" ,".join(sublist) + " ")
                else:
                    f.write(" ,".join(sublist) + "\n")
# -------------------- OCR Processing Class --------------------
class OCRProcessor:
    def __init__(self, lang: str = "en"):
        self.lang = lang
        self.ocr = OCRSingleton(self.lang).ocr

    def extract_text_from_image(self, image) -> List[OCRResult]:
        ocr_results = self.ocr.ocr(image, cls=True)
        if not ocr_results:
            return []

        extracted_data = []
        for result in ocr_results:
            for line in result:
                bbox, (text, prob) = line
                x_min, y_min = int(bbox[0][0]), int(bbox[0][1])
                x_max, y_max = int(bbox[2][0]), int(bbox[2][1])
                extracted_data.append(OCRResult(text=text, bbox=(x_min, y_min, x_max, y_max)))
        return extracted_data

# -------------------- Image Preprocessing Class --------------------
class ImagePreprocessor:
    @staticmethod
    def preprocess_image(image_path: str) -> Tuple[np.ndarray, np.ndarray]:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Error loading image: {image_path}")
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)
        return image, cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    @staticmethod
    def draw_bounding_boxes(image: np.ndarray, bounding_boxes: List[OCRResult]) -> np.ndarray:
        for box in bounding_boxes:
            x_min, y_min, x_max, y_max = box.bbox
            cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            cv2.putText(image, box.text, (x_min, y_min - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        return image

# -------------------- Table Extraction Class --------------------
class TableExtractor:
    @staticmethod
    def structure_text(bounding_boxes: List[OCRResult], sort_along: str = "row") -> List[List[str]]:
        if sort_along == "col":
            bounding_boxes.sort(key=lambda box: box.bbox[0])  # Sort by x-coordinates (columns)
        else:
            bounding_boxes.sort(key=lambda box: box.bbox[1])  # Default: Sort by y-coordinates (rows)

        rows, current_row = [], [bounding_boxes[0]]
        for i in range(1, len(bounding_boxes)):
            prev_box, curr_box = current_row[-1], bounding_boxes[i]
            if (sort_along == "col" and abs(curr_box.bbox[0] - prev_box.bbox[0]) < 15) or \
               (sort_along == "row" and abs(curr_box.bbox[1] - prev_box.bbox[1]) < 15):
                current_row.append(curr_box)
            else:
                rows.append(current_row)
                current_row = [curr_box]
        rows.append(current_row)

        return [[box.text for box in row] for row in rows]

# -------------------- Main Pipeline Class --------------------
class ReportProcessor:
    def __init__(self, input_folder: str, output_folder: str, sort_along: str = "row", lang: str = "en", clean_text: bool = False):
        self.input = input
        self.input_folder = input_folder
        self.output_folder = output_folder
        self.lang = lang
        self.ocr = OCRProcessor(self.lang)
        self.sort_along = sort_along
        self.clean_text = clean_text

    def process_all_reports(self, save_format="csv"):
        image_paths = FileHandler.get_images_from_folder(self.input_folder)
        if not image_paths:
            print("No images found in the input folder!")
            return

        for idx, image_path in enumerate(image_paths, start=1):
            try:
                print(f"Processing: {image_path}")
                pdf_name = "_".join(os.path.basename(image_path).split('_')[:-4])
                print(f"pdf_name: {pdf_name}")
                sub_output_folder = os.path.join(self.output_folder, pdf_name)
                roi, preprocessed_image = ImagePreprocessor.preprocess_image(image_path)
                bounding_boxes = self.ocr.extract_text_from_image(preprocessed_image)
                structured_text = TableExtractor.structure_text(bounding_boxes, self.sort_along)

                page_number = image_path.split('_')[-3]

                if save_format == "csv":
                    FileHandler.save_to_csv(structured_text, sub_output_folder, f"extracted_csv_{page_number}", self.clean_text)
                elif save_format == "json":
                    FileHandler.save_to_json(structured_text, sub_output_folder, f"extracted_json_{page_number}", self.clean_text)
                elif save_format == 'text':
                    FileHandler.save_to_text(structured_text, sub_output_folder, f"extracted_text_{page_number}", self.clean_text)
                else:
                    print("Invalid save format. Choose 'csv', 'json', or 'text'.")

                roi = ImagePreprocessor.draw_bounding_boxes(roi, bounding_boxes)
                cv2.imshow('Bounding Boxes', roi)
                return structured_text
            except Exception as e:
                print(f"Error processing {image_path}: {e}")

# -------------------- Running the Script --------------------
def run_ocr(input_folder="input", output_folder="output_reports", sort_along="row", lang="en", save_as="csv", clean_text=False, input_type="pdf"):
    if input_type == "image":
        convert_images_in_folder(input_folder, "temp_images")
        input_folder = "temp_images"

    split_pdf(input_folder, DEFAULT.single_page_pdf)
    save_pages_as_images(DEFAULT.single_page_pdf, DEFAULT.input_reports, [0])

    processor = ReportProcessor(DEFAULT.input_reports, output_folder, sort_along, lang, clean_text)
    structured_text = processor.process_all_reports(save_format=save_as)

    FileHandler.delete_folder_securely(DEFAULT.single_page_pdf)
    FileHandler.delete_folder_securely(DEFAULT.input_reports)
    if input_type == "image":
        FileHandler.delete_folder_securely("temp_images")
    
    return structured_text

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="OCR Tool for extracting text from images and pdfs")
    parser.add_argument("--input_folder", type=str, help="Path to input folder containing images or pdfs")
    parser.add_argument("--output_folder", type=str, default="output_reports", help="Path to output folder")
    parser.add_argument("--sort_along", type=str, choices=["row", "col"], default="row", help="Sort along rows or columns")
    parser.add_argument("--lang", type=str, default="en", help="OCR language (default: en, use 'devanagari' for Indic languages)")
    parser.add_argument("--save_as", type=str, choices=["csv", "json", "text"], default="csv", help="Output format")
    parser.add_argument("--clean_text", action="store_true", help="Enable text cleaning")
    parser.add_argument("--input_type", type=str, choices=["image", "pdf"], default="pdf", help="Type of input file")

    args = parser.parse_args()
    run_ocr(args.input_folder, args.output_folder, args.sort_along, args.lang, args.save_as, args.clean_text, args.input_type)

#!/usr/bin/env python3
"""
Build script for Lambda Layer
Creates a zip file with Python dependencies for Lambda functions
"""

import os
import subprocess
import shutil
import zipfile
from pathlib import Path

def build_lambda_layer():
    """Build Lambda layer with Python dependencies"""
    
    # Paths
    layer_dir = Path(__file__).parent
    build_dir = layer_dir / "build"
    python_dir = build_dir / "python"
    zip_file = layer_dir / "lambda_layer.zip"
    
    print("🏗️  Building Lambda Layer...")
    
    # Clean previous build
    if build_dir.exists():
        shutil.rmtree(build_dir)
    
    # Create build directory
    python_dir.mkdir(parents=True, exist_ok=True)
    
    # Install dependencies
    print("📦 Installing dependencies...")
    subprocess.run([
        "pip", "install", 
        "-r", str(layer_dir / "requirements.txt"),
        "-t", str(python_dir),
        "--no-deps"  # Avoid conflicts with Lambda runtime
    ], check=True)
    
    # Create zip file
    print("🗜️  Creating zip file...")
    if zip_file.exists():
        zip_file.unlink()
    
    with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(build_dir):
            for file in files:
                file_path = Path(root) / file
                arc_path = file_path.relative_to(build_dir)
                zf.write(file_path, arc_path)
    
    # Clean up build directory
    shutil.rmtree(build_dir)
    
    print(f"✅ Lambda layer built: {zip_file}")
    print(f"📊 Size: {zip_file.stat().st_size / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    build_lambda_layer()
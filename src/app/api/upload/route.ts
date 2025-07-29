import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedPaths: string[] = [];
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'property-images');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Process each file
    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        continue;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 9);
      const extension = file.name.split('.').pop();
      const filename = `property-${timestamp}-${randomString}.${extension}`;
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      // Add relative path for frontend use
      uploadedPaths.push(`/property-images/${filename}`);
    }

    if (uploadedPaths.length === 0) {
      return NextResponse.json(
        { error: 'No valid image files uploaded' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paths: uploadedPaths,
      message: `Successfully uploaded ${uploadedPaths.length} image(s)`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
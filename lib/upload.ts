import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

export async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Asegurar que existe la carpeta public/uploads/folder
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Generar nombre único
  const extension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, buffer);

  // Devolver la ruta pública
  return `/uploads/${folder}/${fileName}`;
}
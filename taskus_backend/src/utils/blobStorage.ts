import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

export type ContainerName = 'user-pics' | 'organisation-pics' | 'project-pics';

export const uploadImage = async ( containerName: ContainerName, fileName: string, buffer: Buffer) : Promise<string> => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  const size = 512;
  const processedBuffer = await sharp(buffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // key fix for transparent PNGs
    .jpeg({ quality: 80 })
    .toBuffer();

  await blockBlobClient.upload(processedBuffer, processedBuffer.length, {
    blobHTTPHeaders: { blobContentType: 'image/jpeg' }
  });

  return `${blockBlobClient.url}?t=${Date.now()}`;
};

export const deleteImage = async (
  containerName: ContainerName,
  fileName: string
): Promise<void> => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.deleteIfExists();
};
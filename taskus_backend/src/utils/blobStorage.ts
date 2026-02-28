import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

export type ContainerName = 'user-pics' | 'organisation-pics' | 'project-pics';

export const uploadImage = async (
  containerName: ContainerName,
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: mimeType }
  });

  return blockBlobClient.url;
};

export const deleteImage = async (containerName: ContainerName, fileName: string): Promise<void> => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.deleteIfExists();
};
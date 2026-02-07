import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gridfsBucket;
let conn;

export const connectGridFS = () => {
  try {
    conn = mongoose.connection;
    gridfsBucket = new GridFSBucket(conn.db, {
      bucketName: 'videos'
    });
    console.log('GridFS initialized successfully');
    return gridfsBucket;
  } catch (error) {
    console.error('Error initializing GridFS:', error);
    throw error;
  }
};

export const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFS not initialized. Call connectGridFS() first.');
  }
  return gridfsBucket;
};

export { gridfsBucket };
import { existsSync, mkdirSync, readdir, unlink } from 'fs';
import path from 'path';

const deleteFile = (path: string) => {
  unlink(path, () => {
    console.log(path + ' deleted');
  });
};

const createOrClearFolder = (folderPath: string) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  } else {
    readdir(folderPath, (err, files) => {
      if (err) {
        throw err;
      }

      for (const file of files) {
        deleteFile(path.join(folderPath, file));
      }
    });
  }
};

export { deleteFile, createOrClearFolder };

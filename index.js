const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC_PATH = "test";
const DEST_PATH = "compressed";

function flatten(lists) {
  return lists.reduce((a, b) => a.concat(b), []);
}

function getDirectories(srcpath) {
  return fs
    .readdirSync(srcpath)
    .map((file) => path.join(srcpath, file))
    .filter((path) => fs.statSync(path).isDirectory());
}

function getDirectoriesRecursive(srcpath) {
  return [
    srcpath,
    ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive)),
  ];
}

const directories = getDirectoriesRecursive(SRC_PATH).map((dir) => ({
  path: dir,
  isDirectory: true,
  destPath: dir.replace(SRC_PATH, DEST_PATH),
}));

let tree = [];

for (let dir of directories) {
  tree = [
    ...tree,
    dir,
    ...fs
      .readdirSync(dir.path)
      .map((file) => {
        const objPath = `${dir.path}/${file}`;
        const isDirectory = fs.statSync(objPath).isDirectory();
        if (isDirectory) return;
        return {
          path: objPath,
          isDirectory,
          destPath: objPath.replace(SRC_PATH, DEST_PATH),
        };
      })
      .filter((obj) => obj),
  ];
}

let i = 0;
async function optimize() {
  if (!tree[i]) return;

  const obj = tree[i];
  if (obj.isDirectory && !fs.existsSync(obj.destPath)) {
    fs.mkdirSync(obj.destPath);
    console.log(i, "create", obj.path);
  } else if (!obj.path.match(/(jpg|jpeg|png|webp)$/)) {
    console.log(i, "copied", obj.path);
    fs.copyFileSync(obj.path, obj.destPath);
  } else if (!obj.isDirectory) {
    try {
      await sharp(obj.path).webp({ quality: 40 }).toFile(obj.destPath);
      console.log(i, "compressed", obj.path);
    } catch (e) {
      console.log(i, "error", obj.destPath);
      console.error(e);
    }
  }

  i++;
  return await optimize();
}

(async () => {
  await optimize();
})();

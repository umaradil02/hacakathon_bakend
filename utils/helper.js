const jwt = require("jsonwebtoken");
const fs = require("fs");
require("dotenv").config();
const path = require("path");

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const chkFile = (fileName) => {
    const fullPath = path.resolve(process.cwd(), "files", fileName);
    return fs.existsSync(fullPath);
};

const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

const getFileData = (fileName) => {
    const fullPath = path.resolve(process.cwd(), "files", fileName);
    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileData = fs.readFileSync(fullPath, "utf8");
    const oldData = JSON.parse(fileData);
    return oldData;
};

const appendFileData = (fileName, newData) => {
    const data = getFileData(fileName);
    if (!data) {
        throw new Error(`Cannot append data. File "${fileName}" does not exist.`);
    }

    data.data.push(newData);
    addFileData(fileName, data.data);
};

const addFileData = (fileName, newData) => {
    const filePath = path.resolve(process.cwd(), "files", fileName); // Consistent path resolution
    const obj = {
        data: newData,
    };
    fs.writeFileSync(filePath, JSON.stringify(obj));
};

module.exports = {
    generateAccessToken,
    getFileData,
    verifyAccessToken,
    chkFile,
    appendFileData,
    addFileData
};
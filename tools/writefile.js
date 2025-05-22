const fs = require("fs");
const path = require("path");

module.exports = async ({ filePath, content }) => {
  const fullPath = path.join(__dirname, "../", filePath);
  fs.writeFileSync(fullPath, content);
  return { success: true, message: `Written to ${filePath}` };
};

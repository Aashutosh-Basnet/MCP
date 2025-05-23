const simpleGit = require("simple-git");
const path = require("path");

module.exports = async ({ commitMessage }) => {
  try {
    // Initialize git with the correct working directory
    const git = simpleGit(path.resolve(__dirname, '..'));
    
    // Add all changes
    await git.add('.');
    
    // Commit with the provided message
    await git.commit(commitMessage || 'Update files');
    
    // Push to remote
    const result = await git.push('origin', 'main');
    
    return { 
      success: true, 
      message: "Successfully pushed to GitHub",
      details: result 
    };
  } catch (error) {
    console.error('Git operation failed:', error);
    throw new Error(`Git operation failed: ${error.message}`);
  }
};

const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function moveToColumn(issueNumber, action) {
  console.log(`Starting moveToColumn with issueNumber: ${issueNumber}, action: ${action}`);
  
  try {
    const projectId = process.env.PROJECT_ID;
    if (!projectId) {
      throw new Error('PROJECT_ID environment variable is not set');
    }

    console.log(`Using Project ID: ${projectId}`);

    // Get project columns
    console.log('Fetching project columns...');
    const { data: columns } = await octokit.projects.listColumns({
      project_id: parseInt(projectId, 10)
    });

    if (!columns || columns.length === 0) {
      throw new Error('No columns found in the project');
    }

    console.log('Available columns:', columns.map(c => ({ id: c.id, name: c.name })));

    // Determine target column based on action
    let targetColumn;
    const columnMap = {
      opened: 'to do',
      review_requested: 'review',
      closed: 'done',
      merged: 'done'
    };

    const targetColumnName = columnMap[action.toLowerCase()] || 'in progress';
    targetColumn = columns.find(col => col.name.toLowerCase() === targetColumnName);

    if (!targetColumn) {
      console.log(`Column "${targetColumnName}" not found, falling back to first column`);
      targetColumn = columns[0];
    }

    console.log(`Selected target column: ${targetColumn.name} (${targetColumn.id})`);

    // Create card in column
    console.log('Creating project card...');
    const card = await octokit.projects.createCard({
      column_id: targetColumn.id,
      content_id: parseInt(issueNumber, 10),
      content_type: 'Issue'
    });

    console.log('Card created successfully:', card.data.url);
    return true;
  } catch (error) {
    console.error('Error in moveToColumn:', error.message);
    if (error.response) {
      console.error('API Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
}

// Get command line arguments
const issueNumber = process.argv[2];
const action = process.argv[3];

if (!issueNumber || !action) {
  console.error('Missing required arguments. Usage: node project-manager.js <issueNumber> <action>');
  process.exit(1);
}

console.log('Starting project manager with args:', { issueNumber, action });

moveToColumn(issueNumber, action)
  .then(() => {
    console.log('Successfully processed project card');
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to process project card:', error.message);
    process.exit(1);
  });

// Export functions for use in workflows
module.exports = {
  moveToColumn
}; 
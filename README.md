# Master Control Program (MCP) Server

A powerful Node.js server that acts as a Master Control Program, integrating OpenAI's GPT-4 with file operations and git capabilities.

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- OpenAI API key

### Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file
   touch .env

   # Add your OpenAI API key to .env
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

## Project Structure

```
mcp-server/
├── .env                 # Environment variables
├── package.json        # Project configuration
├── server.js          # Main server file
└── tools/
    ├── writefile.js   # File operation utility
    └── gitpush.js     # Git operation utility
```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
   The server will run at `http://localhost:3000`

2. Test the health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

3. Make a request to the MCP:
   ```bash
   curl -X POST http://localhost:3000/run \
     -H "Content-Type: application/json" \
     -d '{"prompt": "your instruction here"}'
   ```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and timestamp
- Example response:
  ```json
  {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

### Run Command
- **POST** `/run`
- Accepts JSON body with a prompt
- Example request:
  ```json
  {
    "prompt": "create a new file called test.txt"
  }
  ```
- Example response:
  ```json
  {
    "success": true,
    "result": {
      "message": "File created successfully"
    }
  }
  ```

## Security Features

1. Rate Limiting
   - 100 requests per 15 minutes per IP
   - Prevents abuse and DoS attacks

2. Input Validation
   - Required prompt field
   - Request body validation

3. Error Handling
   - Structured error responses
   - Detailed error messages in development

4. Environment Variables
   - Secure API key storage
   - Configuration management

## Available Operations

The MCP server can perform two main types of operations:

1. **File Operations** (`write_file`)
   - Create new files
   - Modify existing files
   - Handle file content

2. **Git Operations** (`git_push`)
   - Push changes to repository
   - Handle git commands

## Best Practices

1. **API Key Security**
   - Never commit your .env file
   - Rotate API keys periodically
   - Use environment variables

2. **Monitoring**
   - Check server logs regularly
   - Monitor rate limit usage
   - Track error rates

3. **Maintenance**
   - Keep dependencies updated
   - Regular security audits
   - Backup configurations

## Next Steps

1. Add authentication
2. Implement more tools
3. Add automated tests
4. Set up CI/CD
5. Add monitoring and logging

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License. 
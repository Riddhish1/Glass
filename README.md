# Glass CTF MCP Server

AI-powered Model Context Protocol server for CTF challenge solving and automation.

[Watch the video](https://www.youtube.com/watch?v=Ogpm1Fvv0bA)

## Features

🎯 **CTF Categories Supported:**
- Web Exploitation
- Cryptography
- Binary Exploitation (PWN)
- Forensics
- Reverse Engineering
- OSINT
- Miscellaneous

🤖 **AI-Powered Tools:**
- Automated workflow generation
- Smart tool selection
- Challenge solving assistance
- Exploit template generation

## Installation

1. Install dependencies:
```bash
pip install mcp requests
```

2. Start the Glass CTF server:
```bash
cd C:\MY_PERSONAL_SPACE\Glass
npm start
```

3. Configure the MCP in your AI client using `glass-ctf-mcp.json`

## Available MCP Tools

### Workflow Management
- `create_ctf_workflow` - Create challenge workflow with recommended tools
- `execute_ctf_challenge` - Execute workflow against target

### PWN Tools
- `analyze_binary` - Analyze binary security features
- `generate_exploit` - Generate pwntools exploit template

### Crypto Tools
- `solve_crypto` - Auto-solve crypto challenges

### Forensics Tools
- `analyze_forensics_file` - Analyze files for hidden data

### Reverse Engineering
- `analyze_reverse_binary` - Analyze binaries for reversing

### Web Tools
- `scan_web_challenge` - Scan web applications

### Utilities
- `execute_command` - Execute shell commands
- `server_health` - Check server status

## Usage Example

```python
# Create a PWN workflow
create_ctf_workflow(category="pwn", difficulty="medium")

# Analyze a binary
analyze_binary(binary_path="/path/to/binary")

# Generate exploit
generate_exploit(binary_path="/path/to/binary", host="ctf.example.com", port=9999)

# Solve crypto
solve_crypto(ciphertext="SGVsbG8gV29ybGQh", method="auto")
```

## Configuration

Update `glass-ctf-mcp.json` to change:
- Server URL (default: http://127.0.0.1:8888)
- Timeout settings
- Auto-allow permissions

## Integration with AI Clients

The MCP server integrates with AI assistants (Claude, etc.) to provide CTF automation capabilities through natural language.

Example queries:
- "Analyze this binary for me"
- "Create a workflow to solve this crypto challenge"
- "Scan this web application for vulnerabilities"
- "Generate an exploit for this PWN challenge"

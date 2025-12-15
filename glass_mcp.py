#!/usr/bin/env python3
"""
Glass CTF MCP Server - CTF Challenge Solving & Automation Interface

CTF Challenge Categories: Web | Crypto | PWN | Forensics | Reverse | OSINT | Misc
Framework: FastMCP integration for AI agent communication
"""

import sys
import os
import argparse
import logging
from typing import Dict, Any, Optional
import requests
import time
from datetime import datetime

from mcp.server.fastmcp import FastMCP

class GlassColors:
    """Color palette for Glass CTF framework"""
    
    # Core colors
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    
    # CTF-specific colors
    FLAG_GREEN = '\033[38;5;46m'
    CRYPTO_ORANGE = '\033[38;5;208m'
    PWN_RED = '\033[38;5;196m'
    FORENSICS_BLUE = '\033[38;5;51m'
    REVERSE_PURPLE = '\033[38;5;129m'
    
    SUCCESS = '\033[38;5;46m'
    WARNING = '\033[38;5;208m'
    ERROR = '\033[38;5;196m'
    INFO = '\033[38;5;51m'

class ColoredFormatter(logging.Formatter):
    """Formatter with colors and emojis for Glass MCP"""
    
    COLORS = {
        'DEBUG': GlassColors.BLUE,
        'INFO': GlassColors.SUCCESS,
        'WARNING': GlassColors.WARNING,
        'ERROR': GlassColors.ERROR,
        'CRITICAL': GlassColors.RED
    }
    
    EMOJIS = {
        'DEBUG': '🔍',
        'INFO': '✅',
        'WARNING': '⚠️',
        'ERROR': '❌',
        'CRITICAL': '🔥'
    }
    
    def format(self, record):
        emoji = self.EMOJIS.get(record.levelname, '📝')
        color = self.COLORS.get(record.levelname, GlassColors.WHITE)
        record.msg = f"{color}{emoji} {record.msg}{GlassColors.RESET}"
        return super().format(record)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[🧪 Glass CTF] %(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)]
)

for handler in logging.getLogger().handlers:
    handler.setFormatter(ColoredFormatter(
        "[🧪 Glass CTF] %(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))

logger = logging.getLogger(__name__)

# Default configuration
DEFAULT_GLASS_SERVER = "http://127.0.0.1:8888"
DEFAULT_REQUEST_TIMEOUT = 300
MAX_RETRIES = 3

class GlassClient:
    """Client for communicating with the Glass CTF API Server"""
    
    def __init__(self, server_url: str, timeout: int = DEFAULT_REQUEST_TIMEOUT):
        self.server_url = server_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        
        # Try to connect
        connected = False
        for i in range(MAX_RETRIES):
            try:
                logger.info(f"🔗 Attempting to connect to Glass CTF API at {server_url} (attempt {i+1}/{MAX_RETRIES})")
                response = self.session.get(f"{self.server_url}/health", timeout=5)
                response.raise_for_status()
                health = response.json()
                connected = True
                logger.info(f"🎯 Successfully connected to Glass CTF API Server")
                logger.info(f"🏥 Server status: {health.get('status', 'unknown')}")
                break
            except Exception as e:
                logger.warning(f"❌ Connection attempt {i+1} failed: {str(e)}")
                time.sleep(2)
        
        if not connected:
            logger.error(f"Failed to connect to Glass CTF API Server at {server_url}")
    
    def safe_post(self, endpoint: str, json_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform a POST request with JSON data"""
        url = f"{self.server_url}/{endpoint}"
        try:
            logger.debug(f"📡 POST {url}")
            response = self.session.post(url, json=json_data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"🚫 Request failed: {str(e)}")
            return {"error": str(e), "success": False}
    
    def safe_get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Perform a GET request"""
        url = f"{self.server_url}/{endpoint}"
        try:
            logger.debug(f"📡 GET {url}")
            response = self.session.get(url, params=params or {}, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"🚫 Request failed: {str(e)}")
            return {"error": str(e), "success": False}

def setup_mcp_server(glass_client: GlassClient) -> FastMCP:
    """Set up the MCP server with CTF tool functions"""
    
    mcp = FastMCP("glass-ctf-mcp")
    
    # ============================================================================
    # CTF WORKFLOW TOOLS
    # ============================================================================
    
    @mcp.tool()
    def create_ctf_workflow(category: str, difficulty: str = "medium", description: str = "") -> Dict[str, Any]:
        """
        Create a CTF challenge workflow with recommended tools and steps.
        
        Args:
            category: CTF category (web, crypto, pwn, forensics, reverse, misc, osint)
            difficulty: Challenge difficulty (easy, medium, hard, insane)
            description: Optional challenge description
        
        Returns:
            Workflow with tools, steps, and estimated time
        """
        data = {
            "category": category,
            "difficulty": difficulty,
            "description": description
        }
        logger.info(f"🎯 Creating {category} workflow (difficulty: {difficulty})")
        result = glass_client.safe_post("api/ctf/workflow/create", data)
        
        if result.get("success"):
            workflow = result.get("workflow", {})
            logger.info(f"✅ Workflow created - {len(workflow.get('steps', []))} steps, ~{workflow.get('estimated_time', 'unknown')}")
        
        return result
    
    @mcp.tool()
    def execute_ctf_challenge(category: str, target: str, options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Execute a CTF challenge workflow against a target.
        
        Args:
            category: CTF category
            target: Target file, URL, or binary
            options: Additional options (difficulty, specific tools, etc.)
        
        Returns:
            Execution results with findings
        """
        data = {
            "category": category,
            "target": target,
            "options": options
        }
        logger.info(f"🚀 Executing {category} challenge against: {target}")
        result = glass_client.safe_post("api/ctf/workflow/execute", data)
        
        if result.get("success"):
            results = result.get("result", {}).get("results", [])
            logger.info(f"✅ Challenge execution completed - {len(results)} steps executed")
        
        return result
    
    # ============================================================================
    # PWN TOOLS
    # ============================================================================
    
    @mcp.tool()
    def analyze_binary(binary_path: str, extract_strings: bool = True) -> Dict[str, Any]:
        """
        Analyze a binary for PWN challenges (checksec, strings, protections).
        
        Args:
            binary_path: Path to the binary file
            extract_strings: Whether to extract interesting strings
        
        Returns:
            Binary analysis with security features and recommendations
        """
        data = {
            "binary_path": binary_path,
            "options": {"extract_strings": extract_strings}
        }
        logger.info(f"🔧 Analyzing binary: {binary_path}")
        result = glass_client.safe_post("api/ctf/pwn/analyze", data)
        
        if result.get("success"):
            analysis = result.get("analysis", {})
            checksec = analysis.get("checksec", {})
            logger.info(f"✅ Binary analyzed - PIE: {checksec.get('pie', 'unknown')}, Canary: {checksec.get('canary', 'unknown')}")
        
        return result
    
    @mcp.tool()
    def generate_exploit(binary_path: str, host: str = None, port: int = None) -> Dict[str, Any]:
        """
        Generate a pwntools exploit template for a binary.
        
        Args:
            binary_path: Path to the binary
            host: Remote host (if applicable)
            port: Remote port (if applicable)
        
        Returns:
            Generated exploit script and recommendations
        """
        data = {
            "binary_path": binary_path,
            "host": host,
            "port": port
        }
        logger.info(f"🎯 Generating exploit for: {binary_path}")
        result = glass_client.safe_post("api/ctf/pwn/exploit", data)
        
        if result.get("success"):
            logger.info(f"✅ Exploit template generated")
        
        return result
    
    # ============================================================================
    # CRYPTO TOOLS
    # ============================================================================
    
    @mcp.tool()
    def solve_crypto(ciphertext: str, method: str = "auto", options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Solve cryptography challenges with auto-detection or specific methods.
        
        Args:
            ciphertext: Encrypted text to solve
            method: Solving method (auto, base64, rot13, caesar, xor, etc.)
            options: Additional options (key, shift, etc.)
        
        Returns:
            Possible solutions with confidence scores
        """
        data = {
            "ciphertext": ciphertext,
            "method": method,
            "options": options
        }
        logger.info(f"🔐 Solving crypto challenge (method: {method})")
        result = glass_client.safe_post("api/ctf/crypto/solve", data)
        
        if result.get("success"):
            solutions = result.get("result", {}).get("possible_solutions", [])
            logger.info(f"✅ Found {len(solutions)} possible solutions")
            if solutions and len(solutions) > 0:
                best = solutions[0]
                logger.info(f"🎯 Best match: {best.get('method')} (confidence: {best.get('confidence', 0)})")
        
        return result
    
    # ============================================================================
    # FORENSICS TOOLS
    # ============================================================================
    
    @mcp.tool()
    def analyze_forensics_file(file_path: str, check_steg: bool = True, extract_strings: bool = True) -> Dict[str, Any]:
        """
        Analyze a file for forensics challenges (metadata, steganography, hidden files).
        
        Args:
            file_path: Path to the file
            check_steg: Check for steganography
            extract_strings: Extract interesting strings
        
        Returns:
            Forensics analysis with findings and recommendations
        """
        data = {
            "file_path": file_path,
            "options": {
                "check_steg": check_steg,
                "extract_strings": extract_strings
            }
        }
        logger.info(f"🔍 Analyzing forensics file: {file_path}")
        result = glass_client.safe_post("api/ctf/forensics/analyze", data)
        
        if result.get("success"):
            analysis = result.get("analysis", {})
            steg = analysis.get("steganography", {})
            logger.info(f"✅ Forensics analysis completed")
            if steg and any(steg.values()):
                logger.info(f"🎯 Steganography detected!")
        
        return result
    
    # ============================================================================
    # REVERSE ENGINEERING TOOLS
    # ============================================================================
    
    @mcp.tool()
    def analyze_reverse_binary(binary_path: str, extract_strings: bool = True, analyze_functions: bool = True) -> Dict[str, Any]:
        """
        Analyze a binary for reverse engineering challenges.
        
        Args:
            binary_path: Path to the binary
            extract_strings: Extract interesting strings
            analyze_functions: Analyze functions with radare2
        
        Returns:
            Reverse engineering analysis with functions, strings, and recommendations
        """
        data = {
            "binary_path": binary_path,
            "options": {
                "extract_strings": extract_strings,
                "analyze_functions": analyze_functions
            }
        }
        logger.info(f"🔧 Analyzing binary for reverse engineering: {binary_path}")
        result = glass_client.safe_post("api/ctf/reverse/analyze", data)
        
        if result.get("success"):
            analysis = result.get("analysis", {})
            strings = analysis.get("strings", {})
            if strings and strings.get("flags"):
                logger.info(f"🚩 Flags found in strings!")
        
        return result
    
    # ============================================================================
    # WEB TOOLS
    # ============================================================================
    
    @mcp.tool()
    def scan_web_challenge(url: str, enumerate_dirs: bool = True) -> Dict[str, Any]:
        """
        Scan a web application for CTF challenges.
        
        Args:
            url: Target URL
            enumerate_dirs: Enumerate directories
        
        Returns:
            Web scanning results with vulnerabilities and findings
        """
        data = {
            "url": url,
            "options": {"enumerate_dirs": enumerate_dirs}
        }
        logger.info(f"🌐 Scanning web challenge: {url}")
        result = glass_client.safe_post("api/ctf/web/scan", data)
        
        if result.get("success"):
            scan_results = result.get("scan_results", {})
            vulns = scan_results.get("vulnerabilities", [])
            logger.info(f"✅ Web scan completed - {len(vulns)} vulnerabilities found")
        
        return result
    
    # ============================================================================
    # GENERIC COMMAND EXECUTION
    # ============================================================================
    
    @mcp.tool()
    def execute_command(command: str, use_cache: bool = True) -> Dict[str, Any]:
        """
        Execute a shell command on the Glass CTF server.
        
        Args:
            command: Command to execute
            use_cache: Use command cache
        
        Returns:
            Command execution results
        """
        data = {
            "command": command,
            "use_cache": use_cache
        }
        logger.info(f"⚡ Executing command: {command}")
        result = glass_client.safe_post("api/command", data)
        
        if result.get("success"):
            logger.info(f"✅ Command completed successfully")
        else:
            logger.error(f"❌ Command failed")
        
        return result
    
    # ============================================================================
    # HEALTH CHECK
    # ============================================================================
    
    @mcp.tool()
    def server_health() -> Dict[str, Any]:
        """
        Check Glass CTF server health status.
        
        Returns:
            Server health and available tools
        """
        logger.info(f"🏥 Checking Glass CTF server health")
        result = glass_client.safe_get("health")
        
        if result.get("status") == "healthy":
            logger.info(f"✅ Server is healthy")
        
        return result
    
    return mcp

def main():
    parser = argparse.ArgumentParser(description="Glass CTF MCP Server")
    parser.add_argument(
        "--server",
        type=str,
        default=DEFAULT_GLASS_SERVER,
        help=f"Glass CTF API server URL (default: {DEFAULT_GLASS_SERVER})"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_REQUEST_TIMEOUT,
        help=f"Request timeout in seconds (default: {DEFAULT_REQUEST_TIMEOUT})"
    )
    
    args = parser.parse_args()
    
    logger.info(f"{GlassColors.FLAG_GREEN}🧪 Glass CTF MCP Server Starting...{GlassColors.RESET}")
    logger.info(f"Server: {args.server}")
    logger.info(f"Timeout: {args.timeout}s")
    
    # Initialize client
    glass_client = GlassClient(args.server, args.timeout)
    
    # Setup MCP server
    mcp = setup_mcp_server(glass_client)
    
    # Run MCP server
    logger.info(f"{GlassColors.SUCCESS}✅ Glass CTF MCP Server Ready{GlassColors.RESET}")
    mcp.run()

if __name__ == "__main__":
    main()

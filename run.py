#!/usr/bin/env python
import os
import sys
import logging
from app import run_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        # Use port 8080 since 5000 is likely in use
        port = int(os.environ.get('PORT', 8080))
        logger.info(f"Starting AWS Job Search Python application on port {port}")
        logger.info(f"You can view the application at: http://localhost:{port}")
        run_app(port=port)
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        sys.exit(1)
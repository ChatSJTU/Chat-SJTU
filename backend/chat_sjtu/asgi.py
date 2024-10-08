"""
ASGI config for chat_sjtu project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import dotenv

from django.core.asgi import get_asgi_application
dotenv.load_dotenv(verbose=True)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_sjtu.settings')

application = get_asgi_application()

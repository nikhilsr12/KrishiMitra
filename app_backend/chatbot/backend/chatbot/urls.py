from django.urls import path
from .views import ChatView  # ✅ Correct class-based view

urlpatterns = [
    path("chat/", ChatView.as_view(), name="chat"),  # ✅ Correct usage of class-based view
]

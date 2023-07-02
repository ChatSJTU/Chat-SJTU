from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .models import Session, Message, UserAccount
from oauth.models import UserProfile
from django.utils import timezone
import pytz

STUDENT_LIMIT = 20

# def get_or_create_user(device_id):
#     # 根据设备标识查找或创建对应的用户
#     user, created = User.objects.get_or_create(username=device_id)
#     return user

# 获取会话列表或创建会话
@api_view(['GET', 'POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated]) 
def sessions(request):
    if request.method == 'GET':
        user = request.user  # 从request.user获取当前用户
        sessions = Session.objects.filter(user=user)  # 基于当前用户过滤会话
        data = [{'id': session.id, 'name': session.name} for session in sessions]
        return JsonResponse(data, safe=False)
    elif request.method == 'POST':
        # 创建新会话，并关联到当前用户
        user = request.user
        session = Session.objects.create(name='New Session', user=user)
        data = {'id': session.id, 'name': session.name}
        return JsonResponse(data)

# 删除会话
@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_session(request, session_id):
    try:
        session = Session.objects.get(id=session_id, user=request.user)
        session.delete()
        return JsonResponse({'message': 'Session deleted successfully'})
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)

# 删除所有会话
@api_view(['DELETE'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_all_sessions(request):
    try:
        sessions = Session.objects.filter(user=request.user)
        sessions.delete()
        return JsonResponse({'message': 'All sessions deleted successfully'})
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)


# 获取会话中的消息内容
@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def session_messages(request, session_id):
    try:
        session = Session.objects.get(id=session_id, user=request.user)
        messages = Message.objects.filter(session=session)
        data = []
        for message in messages:
            # 转换时区和格式
            time_str = message.timestamp.astimezone(pytz.timezone('Asia/Shanghai'))
            time_str = time_str.strftime("%Y/%m/%d %H:%M:%S")
            data.append({
                'id': message.id, 
                'content': message.content,
                'sender': message.sender,
                'time': time_str
            })
        return JsonResponse(data, safe=False)
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)

# 发送消息
@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def send_message(request, session_id):
    try:
        user_message = request.data.get('message')
        permission, errorresp = check_and_update_usage(request.user)
        if not permission:
            return errorresp
        session = Session.objects.get(id=session_id, user=request.user)
        # 创建新的用户消息对象，并关联到会话
        user_message_obj = Message.objects.create(
            sender=1,
            session=session,
            content=user_message
        )

        # 待替换逻辑
        ai_message = "本网站正在开发中 😊 **敬请期待~**"

        # 创建新的 AI 回复消息对象，并关联到会话
        ai_message_obj = Message.objects.create(
            sender=0,
            session=session,
            content=ai_message
        )
        # 返回服务端生成的回复消息
        return JsonResponse({
            'message': ai_message, 
            'send_timestamp': user_message_obj.timestamp.isoformat(),
            'response_timestamp': ai_message_obj.timestamp.isoformat()
            })
    except Session.DoesNotExist:
        return JsonResponse({'error': '会话不存在'}, status=404)
    
# 检查并更新使用次数
def check_and_update_usage(user):
    try:
        profile = UserProfile.objects.get(user=user)
        if profile.user_type != 'student':
            return True, None
        
        account= UserAccount.objects.get(user=user)
        today = timezone.now().date()
        if account.last_used != today:
            account.usage_count = 1
            account.last_used = today
        else:
            account.usage_count += 1
        
        if account.usage_count > STUDENT_LIMIT:
            return False, JsonResponse({'error': '到达使用上限'}, status=429)
        else:
            account.save()
            return True, None
    except UserAccount.DoesNotExist:
        return False, JsonResponse({'error': '用户不存在'}, status=404)
    
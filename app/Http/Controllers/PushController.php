<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Notifications\PushDemo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class PushController extends Controller
{
    /**
     * Store the PushSubscription.
     *
     */
    public function store(Request $request)
    {
        $request->validate([
            'endpoint'    => 'required',
            'keys.auth'   => 'required',
            'keys.p256dh' => 'required'
        ]);

        // id|user_id|endpoint|public_key|auth_token|created_at|updated_at
        // `endpoint`, `public_key`, `auth_token`, `content_encoding`, `subscribable_id`, `subscribable_type`,

        $endpoint = $request->endpoint;
        $token = $request->keys['auth'];
        $key = $request->keys['p256dh'];
        $user = Auth::user();
        $user->updatePushSubscription($endpoint, $key, $token);

        return response()->json(['success' => true],200);
    }

    /**
     * Send Push Notifications to all users.
     */
    public function push() {
        Notification::send(User::all(),new PushDemo);
        return response()->json(['success' => true],200);
    }
}

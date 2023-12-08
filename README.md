## Package Installation

Since we are using a Laravel package called Webpush, we can generate these keys with an artisan command. Let’s install the package:

```shell
composer require laravel-notification-channels/webpush
```

Let’s add the HasPushSubscription trait to the Existing User model:

```php
// app/Models/User.php
<?php

use NotificationChannels\WebPush\HasPushSubscriptions; //import the trait

class User extends Model
{

    use HasPushSubscriptions; // add the trait to our class

    //our model code...

}
```

Once it is added this trait, we will need to publish the migration that will create the push_subscriptions table:

```shell
php artisan vendor:publish --provider="NotificationChannels\WebPush\WebPushServiceProvider" --tag="migrations"
```

Run the migrate command to create the necessary table:

```shell
php artisan migrate
```

Generate the VAPID keys (required for browser authentication) with:

```shell
php artisan webpush:vapid
```

This command will set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in our .env file.

# Usage

Now we can use the channel in our `via()` method inside the notification as well as send a web push notification:
 
Example: 

```php
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class AccountApproved extends Notification
{
    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title('Approved!')
            ->icon('/approved-icon.png')
            ->body('Your account was approved!')
            ->action('View account', 'view_account')
            ->options(['TTL' => 1000]);
            // ->data(['id' => $notification->id])
            // ->badge()
            // ->dir()
            // ->image()
            // ->lang()
            // ->renotify()
            // ->requireInteraction()
            // ->tag()
            // ->vibrate()
    }
}
```

# Save/Update Subscriptions

To save or update a subscription use the `updatePushSubscription($endpoint, $key = null, $token = null, $contentEncoding = null)` method on your user:

```php
$user = \App\User::find(1);

$user->updatePushSubscription($endpoint, $key, $token, $contentEncoding);
```

The `$key` and `$token` are optional and are used to encrypt your notifications. Only encrypted notifications can have a payload.

# Delete Subscriptions

To delete a subscription use the `deletePushSubscription($endpoint)` method on your user:

Let’s create our PushController :

```php
php artisan make:controller PushController
```

Now open the PushController and the following code.

```php
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
```

Now we need to create a `Notification` in Laravel to send Push Notifications :

```shell
php artisan make:notification PushDemo
```

Open the notification class which is located in app/Notifcations directory and add this code:

```php
<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushMessage;
use NotificationChannels\WebPush\WebPushChannel;

class PushDemo extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        return (new WebPushMessage)
            ->title('I\'m Notification Title')
            ->icon('/notification-icon.png')
            ->body('Great, Push Notifications work!')
            ->action('View App', 'notification_action')
            ->options(['TTL' => 1000]);
        // ->data(['id' => $notification->id])
        // ->badge()
        // ->dir()
        // ->image()
        // ->lang()
        // ->renotify()
        // ->requireInteraction()
        // ->tag()
        // ->vibrate()
    }
}

```

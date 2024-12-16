import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const webhook = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred during webhook verification', { status: 400 });
  }

  const eventType = evt.type;

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

      const user = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || '', // Ensure email is safely accessed
        username: username || '',
        firstName: first_name || '',
        lastName: last_name || '',
        photo: image_url || '',
      };

      const newUser = await createUser(user);

      

      return NextResponse.json({ message: 'User created successfully', user: newUser });
    }

    if (eventType === 'user.updated') {
      const { id, image_url, first_name, last_name, username } = evt.data;

      const updatedData = {
        
        firstName: first_name || '',
        lastName: last_name || '',
        username: username || '',
        photo: image_url || '',
      };

      const updatedUser = await updateUser(id, updatedData);

      return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;

      const deletedUser = await deleteUser(id!);

      return NextResponse.json({ message: 'User deleted successfully', user: deletedUser });
    }
  } catch (err) {
    console.error('Error handling event:', err);
    return new Response('Internal Server Error', { status: 500 });
  }

  return new Response('Unhandled event type', { status: 200 });
}

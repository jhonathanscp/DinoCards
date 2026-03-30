<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    /**
     * Store the uploaded image to the user's private disk and return its secure API URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // MAX 5MB
        ]);

        $user = $request->user();

        // Save in a private directory inside storage/app specifically for this user
        $path = $request->file('image')->store("flashcards/{$user->id}", 'local');

        // Extract just the filename to build the new secure URL
        $filename = basename($path);

        return response()->json([
            'image_url' => '/api/images/' . $filename
        ]);
    }

    /**
     * Serve the authenticated user's image securely.
     */
    public function show(Request $request, $filename)
    {
        $user = $request->user();
        $path = "flashcards/{$user->id}/{$filename}";

        if (!Storage::disk('local')->exists($path)) {
            abort(404, 'Image not found.');
        }

        // Return the raw file as a secure response (it won't be accessible without auth)
        return response()->file(Storage::disk('local')->path($path));
    }
}

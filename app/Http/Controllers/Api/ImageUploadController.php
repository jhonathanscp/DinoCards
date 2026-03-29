<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ImageUploadController extends Controller
{
    /**
     * Store the uploaded image to the public disk and return its relative URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // MAX 5MB
        ]);

        $path = $request->file('image')->store('flashcards', 'public');

        return response()->json([
            'image_url' => '/storage/' . $path
        ]);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
          Schema::create('enrollments', function (Blueprint $table) {
            $table->id('enrollment_id');
            $table->foreignId('course_id')->constrained('courses', 'course_id');
            $table->foreignId('student_id')->constrained('users', 'id');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->float('final_grade')->nullable();
            $table->timestamps();

            // A student cannot enroll in the same course twice
            $table->unique(['course_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};

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
         Schema::create('audit_logs', function (Blueprint $table) {
            $table->id('audit_id');
            $table->foreignId('actor_user_id')->constrained('users', 'id'); // who performed the action
            $table->string('action_type'); // CREATE_COURSE, DELETE_USER, UPDATE_GRADE
            $table->string('entity_type'); // Users, Courses, Assignments, Enrollments, Submissions
            $table->unsignedBigInteger('entity_id'); // affected record
            $table->json('before_json')->nullable(); // eski veri
            $table->json('after_json')->nullable(); // yeni veri
            $table->string('ip_address')->nullable(); // IP
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

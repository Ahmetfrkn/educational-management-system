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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id('submission_id');
            $table->foreignId('assignment_id')->constrained('assignments', 'assignment_id');
            $table->foreignId('student_id')->constrained('users', 'id');
            $table->timestamp('submitted_at')->useCurrent();
            $table->text('content')->nullable(); // url veya text
            $table->integer('score')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users', 'id');
            $table->timestamps();

            $table->unique(['assignment_id', 'student_id']); // single submission constraint
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};

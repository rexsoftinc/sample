<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSearchMorphTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('search_morph', function(Blueprint $table)
        {
            $table->engine = 'MyISAM';
            $table->increments('id');
            $table->integer('entityId')->index();
            $table->enum('type', ['company', 'individual']);
            $table->tinyInteger('sizeId')->index();
            $table->tinyInteger('mainOffice')->index();
            $table->tinyInteger('branch')->index();
            $table->tinyInteger('deverse')->index();
            $table->tinyInteger('women')->index();
            $table->text('keywords');
        });

        DB::statement('ALTER TABLE search_morph ADD FULLTEXT search(keywords)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('search_morph', function($table) {
            $table->dropIndex('search');
        });
        Schema::drop('search_morph');
    }

}

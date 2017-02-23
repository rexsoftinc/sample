<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSearchClientsTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('search_clients', function(Blueprint $table)
        {
            $table->engine = 'MyISAM';
            $table->increments('id');
            $table->integer('morphId')->index();
            $table->integer('entityId')->index();
            $table->enum('type', ['company', 'individual']);
            $table->integer('clientId')->index();
            $table->integer('sectorId')->index();
            $table->text('keywords');
        });

        DB::statement('ALTER TABLE search_clients ADD FULLTEXT search(keywords)');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('search_clients', function($table) {
            $table->dropIndex('search');
        });
        Schema::drop('search_clients');
    }

}

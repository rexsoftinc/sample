<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSearchSectorsExpertisesTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('search_sectors_expertises', function(Blueprint $table)
        {
            $table->increments('id');
            $table->integer('morphId')->index();
            $table->integer('entityId')->index();
            $table->integer('sectorsId')->index();
            $table->integer('expertisesId')->index();
            $table->enum('type', ['company', 'individual']);
            $table->index(['entityId', 'type']);
            $table->index(['type', 'sectorsId']);
            $table->index(['type', 'expertisesId']);
            $table->index(['type', 'sectorsId', 'expertisesId']);
            $table->index(['sectorsId', 'expertisesId']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('search_sectors_expertises');
    }

}

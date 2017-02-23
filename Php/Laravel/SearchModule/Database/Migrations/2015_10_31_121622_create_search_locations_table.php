<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSearchLocationsTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('search_locations', function(Blueprint $table)
        {
            $table->increments('id');
            $table->integer('morphId')->index();
            $table->integer('entityId')->index();
            $table->enum('type', ['company', 'individual']);
            $table->unique(['entityId', 'type']);
            $table->integer('countryId')->index();
            $table->integer('stateId')->index();
            $table->integer('cityId')->index();
            $table->index(['type', 'countryId']);
            $table->index(['type', 'countryId', 'stateId']);
            $table->index(['type', 'countryId', 'stateId', 'cityId']);
            $table->index(['type', 'countryId', 'cityId']);
            $table->index(['countryId', 'stateId']);
            $table->index(['countryId', 'cityId']);
            $table->index(['countryId', 'stateId', 'cityId']);
            $table->float('geoLat')->index();
            $table->float('geoLong')->index();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('search_locations');
    }

}

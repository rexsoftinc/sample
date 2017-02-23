<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddIndexToSearchMorphTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('search_morph', function(Blueprint $table)
        {
			DB::statement('ALTER TABLE search_morph ADD FULLTEXT title(title)');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('search_morph', function(Blueprint $table)
        {

        });
    }

}

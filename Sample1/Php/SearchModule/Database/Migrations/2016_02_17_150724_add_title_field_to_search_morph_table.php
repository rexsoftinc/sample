<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTitleFieldToSearchMorphTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('search_morph', function(Blueprint $table)
        {
			$table->string('title')->after('women');
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
			$table->dropColumn('title');
        });
    }

}

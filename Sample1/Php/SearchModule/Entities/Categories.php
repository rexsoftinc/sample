<?php 
namespace Modules\Search\Entities;
   
use Illuminate\Database\Eloquent\Model;

/**
 * Class Categories
 * @package Modules\Search\Entities
 */
class Categories extends Model
{
    public $timestamps = FALSE;

    protected $table = 'search_sectors_expertises';

    protected $fillable = [
    	'morphId',
		'entityId',
		'sectorsId',
		'categoriesId',
		'type'
	];

}
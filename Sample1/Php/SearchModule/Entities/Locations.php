<?php 
namespace Modules\Search\Entities;
   
use Illuminate\Database\Eloquent\Model;

/**
 * Class Locations
 * @package Modules\Search\Entities
 */
class Locations extends Model
{
	public $timestamps = FALSE;

	protected $table = 'search_locations';

    protected $fillable = [
    	'morphId',
		'entityId',
		'type',
		'countryId',
		'stateId',
		'cityId',
		'geoLat',
		'goeLong'
	];

}
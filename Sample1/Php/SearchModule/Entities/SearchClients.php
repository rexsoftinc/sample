<?php namespace Modules\Search\Entities;
   
use Illuminate\Database\Eloquent\Model;

/**
 * Class SearchClients
 * @package Modules\Search\Entities
 */
class SearchClients extends Model
{

    public $timestamps = FALSE;

	protected $table = 'search_clients';

	protected $fillable = [
    	'morphId',
    	'entityId', 
    	'type', 
    	'clientId', 
    	'sectorId', 
    	'keywords'
    ];
}
<?php 
namespace Modules\Search\Entities;
   
use Illuminate\Database\Eloquent\Model;

/**
 * Class Morph
 * @package Modules\Search\Entities
 */
class Morph extends Model
{
	public $timestamps = FALSE;

	protected $table = 'search_morph';

    protected $fillable = [
		'entityId',
		'type',
		'sizeId',
		'mainOffice',
		'branch',
		'deverse',
		'woman',
		'keywords'
	];

    /**
     * @return array
     */
	public static function getAlpha()
	{
		$alpha = [];
		$items = \DB::table('search_morph')->orderBy('title', 'asc')->lists('title');
		foreach($items as $item) {
			$alpha[] = strtoupper(substr(trim($item), 0, 1));
		}
		$alpha = array_unique($alpha);
 		
		return $alpha;
	}

}
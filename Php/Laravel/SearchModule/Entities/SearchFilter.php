<?php namespace Modules\Search\Entities;
   
use Illuminate\Database\Eloquent\Model;

use \Modules\Companies\Entities\Sector;
use \Modules\Companies\Entities\Expertise;
use \Modules\Companies\Entities\Size;

/**
 * Class SearchFilter
 * @package Modules\Search\Entities
 */
class SearchFilter extends Model {
	
	private $limit = 0;
	private $request = [];
	private $doRedirect = FALSE;
	private $params = [];
	private $filter = [];
	
	private $sections = [
		'Aliases',
		'General',
		'Criterias',
		'Locations',
		'Clients',
		'Morph'
	];

    /**
     * SearchFilter constructor.
     * @param $limit
     */
	function __construct($limit)
	{
		$this->limit = $limit;
		$this->request = \Request::all();
		$this->params = \Config::get('search.params');
		$this->filter = \Config::get('search.filter');
		
		$this->processData();
	}

    /**
     * @return array
     */
	public function getRequest()
	{
		return $this->request;
	}

    /**
     * @return array
     */
	public function getParams()
	{
		return $this->params;
	}

    /**
     * @return array
     */
	public function getParamsDesc()
	{
		$params = [];
		foreach($this->params as $key => $value) {
			if($value == FALSE) continue;
			if(is_array($value) && count($value) == 0) continue;
			
			if(is_array($value)) {
				$params[$key] = [];
				foreach($value as $v) {
					$params[$key][] = (isset($v->name)) ? $v->name : $v;
				}
			} else {
				$params[$key] = (isset($value->name)) ? $value->name : $value;
			}
			
		}
		return $params;
	}

    /**
     * @return array
     */
	public function getQuery()
	{
		$params = [];
		foreach($this->params as $key => $value) {
			if($value == FALSE) continue;
			if(is_array($value) && count($value) == 0) continue;
			
			if(is_array($value)) {
				$params[$key] = [];
				foreach($value as $v) {
					$params[$key][] = (isset($v->slug)) ? $v->slug : $v;
				}
			} else {
				$params[$key] = (isset($value->slug)) ? $value->slug : $value;
			}
			
		}
		return $params;
	}

    /**
     * @return array
     */
	public function getFilter()
	{
		$this->processFilter($this->filter);
		return $this->filter;
	}

    /**
     * @param $filter
     */
	private function processFilter(&$filter)
	{
		foreach($filter as $key => &$item) {
			if(is_array($item) && count($item)) {
				$this->processFilter($item);
			}
			if(!isset($this->params[$key])) continue;
			if($this->params[$key] == FALSE || (is_array($this->params[$key]) && count($this->params[$key]) == 0)) continue;
			
			$value = $this->params[$key];
			if(is_array($value)) {
				$item = [];
				foreach($value as $v) {
					$item[] = (isset($v->id)) ? $v->id : $v;
				}
			} else {
				$item = (isset($value->id)) ? $value->id : $value;
			}
		}
	}

    /**
     * @return array
     */
	private function processData()
	{
		foreach($this->sections as $section) {
			$func = 'process'.$section;
			if(method_exists($this, $func)) {
				$this->$func();
			}
		}
		return $this->params;
	}

    /**
     * @return void
     */
	private function processAliases()
	{
		$alias = \Request::segment(1);
		$slug = \Request::segment(2);
		
		switch ($alias) {
			
			case 'sector':
				$this->setCollection($this->params['sectors'], $slug, new Sector());
				break;
				
			case 'areas-of-expertise':
				$this->setCollection($this->params['expertises'], $slug, new Expertise());
				break;
				
			case 'size':
				$this->setCollection($this->params['size'], $slug, new Size());
				break;
				
			case 'search':

				break;
				
			default:
				// 404
				break;
		}
	}

    /**
     * @return void
     */
	private function processGeneral()
	{
		if(isset($this->request['offset'])) {
			$this->setInt($this->params['offset'], $this->request['offset']);
		}
		
		if(isset($this->request['page'])) {
			$page = $this->setInt($this->params['page'], $this->request['page']);
			$this->setInt($this->params['offset'], (($page-1) * $this->limit) );
		}

		if(isset($this->request['order'])) {
			switch ($this->request['order']) {
				case 'relevance':
					$this->params['order'] = 'relevance';
					break;
				case 'alpha':
					$this->params['order'] = 'alpha';
					break;
				case 'date':
					$this->params['order'] = 'date';
					break;
			}
		}
		
		if(isset($this->request['type'])) {
			switch ($this->request['type']) {
				case 'company':
					$this->params['type'] = 'company';
					break;
				case 'individual':
					$this->params['type'] = 'individual';
					break;
			}
		}
		
		if(isset($this->request['alpha'])) {
			$this->setString($this->params['alpha'], $this->request['alpha']);
		}
		
	}

    /**
     * @return void
     */
	private function processCriterias()
	{
		if(isset($this->request['sectors'])) {
			$this->setCollection($this->params['sectors'], $this->request['sectors'], new Sector());
		}

		if(isset($this->request['expertises'])) {
			$this->setCollection($this->params['expertises'], $this->request['expertises'], new Expertise());
		}
	}

    /**
     * @return void
     */
	private function processLocations()
	{
		
		if(isset($this->request['zip'])) {
			$this->setString($this->params['zip'], $this->request['zip']);
		}
		
		if(isset($this->request['miles']) && $this->params['zip']) {
			$this->setInt($this->params['miles'], $this->request['miles']);
		} 
		
		if(isset($this->request['country'])) {
			$this->setInt($this->params['country'], $this->request['country']);
		}
		
		if(isset($this->request['state'])) {
			$this->setInt($this->params['state'], $this->request['state']);
		}

		if(isset($this->request['city'])) {
			$this->setInt($this->params['city'], $this->request['city']);
		}
		
		if(isset($this->request['location'])) {
			switch ($this->request['location']) {
				case 'area':
					if($this->params['zip'] && $this->params['miles']) {
						$this->params['location'] = 'area';
					}
					break;
				case 'exact':
					if($this->params['country'] || $this->params['state'] || $this->params['city']) {
						$this->params['location'] = 'exact';
					}
					break;
			}
		}
		
	}

    /**
     * @return void
     */
	private function processClients()
	{
		if(isset($this->request['clients_keywords'])) {
			$this->setString($this->params['clients_keywords'], $this->request['clients_keywords']);
		}
		
		if(isset($this->request['clients_sectors'])) {
			$this->setCollection($this->params['clients_sectors'], $this->request['clients_sectors'], new Sector());
		}
	}

    /**
     * @return void
     */
	private function processMorph()
	{
		
		if(isset($this->request['keywords'])) {
			$this->setString($this->params['keywords'], $this->request['keywords']);
		}
		
		if(isset($this->request['size'])) {
			$this->setCollection($this->params['size'], $this->request['size'], new Size());
		}

		if(isset($this->request['is_mainoffice'])) {
			$this->setInt($this->params['is_mainoffice'], $this->request['is_mainoffice']);
		}
		
		if(isset($this->request['is_branch'])) {
			$this->setInt($this->params['is_branch'], $this->request['is_branch']);
		}
		
		if(isset($this->request['is_deverse'])) {
			$this->setInt($this->params['is_deverse'], $this->request['is_deverse']);
		}
		
		if(isset($this->request['is_women'])) {
			$this->setInt($this->params['is_women'], $this->request['is_women']);
		}
		
		if(isset($this->request['exclude'])) {
			$this->setString($this->params['exclude'], $this->request['exclude']);
		}
		
	}

    /**
     * @param $target
     * @param $request
     * @return bool|int
     */
	private function setInt(&$target, $request)
	{
		$value = intval($this->getStr($request));
		if($value) {
			$target = $value;
			return $value;
		}
		return FALSE;
	}

    /**
     * @param $target
     * @param $request
     * @return bool|string
     */
	private function setString(&$target, $request) {
		$value = $this->getStr($request);
		if($value) {
			$target = $value;
			return $value;
		}
		return FALSE;
	}

    /**
     * @param $target
     * @param $request
     * @param $model
     * @return array|bool
     */
	private function setCollection(&$target, $request, $model)
	{
		$slugs = $this->getArray($request);
		if(count($slugs) == 0) return FALSE;
		$collection = $model::whereIn('slug', $slugs)->get();
		if(is_array($target)) {
			foreach($collection as $item) {
				$target[] = $item;
			}
		} else {
			$target = (isset($collection[0])) ? $collection[0] : FALSE;
		}
		return $target;
	}

    /**
     * @param $value
     * @return array
     */
	private function getArray($value)
	{
		$array = [];
		if(!is_array($value)) {
			$value = explode(',', $value);
		}
		foreach($value as $item) {
			if($item == '') continue;
			if(is_numeric($item)) {
				$array[] = intval($item);
			} else {
				$array[] = $this->getStr($item);
			}
			
		}
		return $array;
	}

    /**
     * @param $value
     * @return string
     */
	private function getStr($value) {
		$chars_to_replace = [
			'\'',
			'"',
			'/',
			'\\'
		];
		foreach($chars_to_replace as $char) {
			if($value == '') continue;
			if(strpos($char, $value) === FALSE) continue;
			$value = \DB::connection()->getPdo()->quote($value);
		}
		return trim($value);
	}

}
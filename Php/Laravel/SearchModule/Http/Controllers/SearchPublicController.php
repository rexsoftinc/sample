<?php namespace Modules\Search\Http\Controllers;

/**
 * Class SearchPublicController
 * @package Modules\Search\Http\Controllers
 */
class SearchPublicController extends Controller {
	
	private $doDefaultSearch = TRUE;
	private $subSearchExecuted = FALSE;
	private $resultIds = [];
	private $exludeIds = [];
	private $limit = 0;
	private $requestData = [];
	private $semanticRedirect = TRUE;
	private $filterData = [];
	
	private $request = [];

    /**
     * SearchPublicController constructor.
     */
	function __construct()
	{
		// DEPENDS ON AUTH
		$this->limit = (\Auth::user()->get()) ? config('search.limit') : 5;
		$this->filter = new SearchFilter($this->limit);
	}

    /**
     * @return View
     */
	public function index() 
	{

		if(\Request::get('saveSearch')) {
			return $this->saveSearch();
		}
		
		$this->filterData = $this->filter->getFilter();
		
		if(\Request::isMethod('post') && !\Request::ajax()) {
			$route = $this->responseRedirect();
			return redirect($route);
		}
		
		if($this->filterData['offset'] == 0) {
			Tracking::triggerSearchExecuted();
		}
				
		$results = $this->getResults();
		
		if(\Request::ajax()) {
			return $this->responseAjax($results);
        }
		
		return $this->responseView($results);
		
	}

    /**
     * @return mixed
     */
	public function getLocations() 
	{
		$input = \Request::all();
        if(isset($input['parentId'])) {
			$cities = Location::getCities($input['parentId']);
			return \Response::json($cities);
        }
		return \Response::json([]);
	}

    /**
     * @return mixed
     */
	private function saveSearch()
	{
		$user = \Auth::user()->get();
		
		$route = \Request::fullUrl();
		$route = str_replace(\Request::root(), '', $route);
		if(strpos($route, '/') !== 0) {
			$route = '/'.$route;
		}
		
		$params = $this->filter->getParamsDesc();
		
		$params['total'] = \Request::input('results');
		
		UsersSearches::insert([
			'user_id' => $user->id,
			'location' => $route,
			'params' => json_encode($params)
		]);
		
		return Notify::success('Search saved', []);
	}

    /**
     * @return array
     */
	private function getResults()
    {
		
    	$this->filterCriterias();

		switch ($this->filterData['locations']['location']) {
			case 'area':
				$this->filterLocationsArea();
				break;
			case 'exact':
				$this->filterLocationsExact();
				break;
		}
		
		$this->filterClients();
		
		$this->filterAlpha();

		$count = 0;
		$items = [];
		
		if($this->filterData['morph']['keywords']) {
			$modes = ['like', 'like_milti', 'boolean', 'natural'];
		} else {
			$modes = ['none'];
		}
		
		foreach($modes as $mode) {
			$count += $this->filterMorph($mode, 'count');
			$modeResults = $this->filterMorph($mode, 'getResults');
			foreach($modeResults as $entry) {
				$this->exludeIds[] = $entry->id;
			}
			$items = array_merge($items, $modeResults);
		}
		
		if($this->doDefaultSearch) {
			$count = $this->defaultCount();
			$items = $this->defaultSearch();
		}
		
		return [
			'total' => $count,
			'items' => $this->getOrigin($items) 
		];
    }

    /**
     * @return  void
     */
	private function filterCriterias()
	{
		$doQuery = false;
		$filter = $this->filterData['criterias'];
		$model = \DB::table('search_sectors_expertises');
		
		if(count($filter['sectors'])) {
			$doQuery = true;
            $model = $model->whereIn('sectorsId', $filter['sectors']);
		}
		
		if(count($filter['expertises'])) {
            $doQuery = true;
            $model = $model->whereIn('expertisesId', $filter['expertises']);
        }
		
		$this->doSubSearch($doQuery, $model);
	}

    /**
     * @return  void
     */
	private function filterLocationsArea() 
	{
		$filter = $this->filterData['locations'];
		$model = \DB::table('search_locations');
		
		if($filter['zip'] == FALSE || $filter['miles'] == FALSE) return;
		
		$curl = new \Ivory\HttpAdapter\CurlHttpAdapter();
		$geocoder = new \Geocoder\Provider\GoogleMaps($curl);
		$formatter = new \Geocoder\Formatter\StringFormatter();
		
		try {
			
			$covering = $geocoder->geocode($filter['zip']);
			$point = $covering->first()->getCoordinates();
			
			$x = $point->getLatitude();
			$y = $point->getLongitude();
			 
			$xDist = $x * (110.54 / 1.609);
			$yDist = $y * (111.32 / 1.609) * cos(deg2rad($x));
			
			$rightUpPointX = $xDist + $filter['miles'];
			$rightUpPointY = $yDist + $filter['miles'];
			 
			$leftDownPointX = $xDist - $filter['miles'];
			$leftDownPointY = $yDist - $filter['miles'];
			 
			$rightUpPoint = [
				'lat' => $rightUpPointX / (110.54 / 1.609),
				'lon' => $rightUpPointY / ((111.32 / 1.609) * cos(deg2rad($x)))
			];
			 
			$leftDownPoint = [
				'lat' => $leftDownPointX / (110.54 / 1.609),
				'lon' => $leftDownPointY / ((111.32 / 1.609) * cos(deg2rad($x)))
			];
			 
			$model = $model->whereBetween('geoLat', [
				$leftDownPoint['lat'], 
				$rightUpPoint['lat']
			])->whereBetween('geoLong', [
				$leftDownPoint['lon'], 
				$rightUpPoint['lon']
			]);
			
			$entries = $this->doSubSearch(TRUE, $model, 'getAllResults');
			
			$ids = [];
			foreach($entries as $entry) {
				
				$pointX = $entry->geoLat - $x;
				$pointY = $entry->geoLong - $y;
				
				$pointXdist = $pointX * (110.54 / 1.609);
				$pointYdist = $pointY * (111.32 / 1.609) * cos(deg2rad($pointX));
				
				$radius = sqrt(pow($pointXdist,2) + pow($pointYdist, 2));
				
				if($radius < $filter['miles']) {
					array_push($ids, $entry->morphId);
				}
			}
			
			$this->resultIds = array_unique($ids);
			
		} catch(\Exception $e) {}
	}

    /**
     * @return  void
     */
	private function filterLocationsExact()
	{
		$doQuery = FALSE;
		$filter = $this->filterData['locations'];
		$model = \DB::table('search_locations');
		
		if($filter['country']) {
			$doQuery = TRUE;
			$model = $model->where('countryId', $filter['country']);
		}
		
		if($filter['state']) {
			$doQuery = TRUE;
			$model = $model->where('stateId', $filter['state']);
		}
		
		if($filter['city']) {
			$doQuery = TRUE;
			$model = $model->where('cityId', $filter['city']);
		}
		
		$this->doSubSearch($doQuery, $model);
	}

    /**
     * @return  void
     */
	private function filterClients()
	{
		$doQuery = false;
		$filter = $this->filterData['clients'];
		$model = \DB::table('search_clients');
		
		if($filter['clients_keywords']) {
			$doQuery = true;
			$model = $model->whereRaw('MATCH(keywords) AGAINST(? IN BOOLEAN MODE)', [0 => $filter['clients_keywords']]);
		}
		
		if(count($filter['clients_sectors'])) {
			$doQuery = true;
			$model = $model->whereIn('sectorId', $filter['clients_sectors']);
		}
		
		$this->doSubSearch($doQuery, $model);
	}

    /**
     * @return  void
     */
	private function filterAlpha()
	{
		$doQuery = false;
		$filter = $this->filterData['alpha'];
		$model = \DB::table('search_morph');
		
		if($filter) {
			$doQuery = true;
			$model = $model->where('title', 'like', $filter.'%');
		}
		
		$this->doSubSearch($doQuery, $model, 'alpha');
	}

    /**
     * @param bool $searchType
     * @param bool $outputType
     * @return array
     */
	private function filterMorph($searchType = FALSE, $outputType = FALSE)
	{
		$doQuery = FALSE;
		$filter = $this->filterData['morph'];
		$model = \DB::table('search_morph');
		
		if($filter['is_mainoffice'] && $filter['is_branch'] == FALSE) {
			$doQuery = TRUE;
			$model = $model->where('mainOffice', 1);
		}
		
		if($filter['is_branch'] && $filter['is_mainoffice'] == FALSE) {
			$doQuery = TRUE;
			$model = $model->where('branch', 1);
		}
		
		if($filter['is_deverse']) {
			$doQuery = TRUE;
			$model = $model->where('deverse', 1);
		}
		
		if($filter['is_women']) {
			$doQuery = TRUE;
			$model = $model->where('women', 1);
		}
		
		if($filter['size']) {
			$doQuery = TRUE;
			$model = $model->where('sizeId', $filter['size']);
		}

		if($filter['exclude']) {
			$doQuery = TRUE;
			$model = $model->whereRaw('(MATCH(keywords) AGAINST(? IN BOOLEAN MODE)) = 0', [0 => '(' . $filter['exclude'] . ')']);
		}
		
		if($filter['keywords']) {
			$doQuery = TRUE;
			switch ($searchType) {
				case 'like':
					$model = $model->where('title', 'like', $filter['keywords'].'%');
					$model->orderBy('title');
					break;
				case 'like_milti':
					$words = explode(' ', $filter['keywords']);
					$model = $model->where(function($query) use ($words) {
						foreach ($words as $word) {
							$query->orWhere('title', 'like', $word.'%');
						}
					});
					$model->orderBy('title');
					break;
				case 'boolean':
					$model = $model->whereRaw('(MATCH(title) AGAINST(? IN BOOLEAN MODE)) > 0', [0 => $filter['keywords']]);
					$model->orderBy('title');
					break;
				case 'natural':
					$model = $model->whereRaw('MATCH(keywords) AGAINST(? IN NATURAL LANGUAGE MODE) > 0', [0 => $filter['keywords']]);
					if($outputType!='count') {
						$model = $model->select(['*', \DB::raw('MATCH(keywords) AGAINST("'.$filter['keywords'].'" IN NATURAL LANGUAGE MODE) as score')]);
						$model = $model->orderBy('score', 'DESC');
					}
					break;
			}
		} else {
			$model = $model->orderBy('title');
		}
		
		return $this->doSearch($doQuery, $model, $outputType);
	}

    /**
     * @param $doQuery
     * @param $model
     * @param bool $returnMode
     * @return array
     */
	private function doSubSearch($doQuery, $model, $returnMode = FALSE) 
	{
		if($returnMode!='alpha') {
			
			if($this->filterData['type']) {
	            $model = $model->where('type', $this->filterData['type']);
	        }
			if(count($this->resultIds)) {
	            $model = $model->whereIn('morphId', $this->resultIds);
	        }
			if(count($this->exludeIds)) {
	            $model = $model->whereNotIn('morphId', $this->resultIds);
	        }

		} else {
			
			if($this->filterData['type']) {
	            $model = $model->where('type', $this->filterData['type']);
	        }
			if(count($this->resultIds)) {
	            $model = $model->whereIn('id', $this->resultIds);
	        }
			if(count($this->exludeIds)) {
	            $model = $model->whereNotIn('id', $this->resultIds);
	        }

		}
		if($doQuery) {
			$this->doDefaultSearch = FALSE;
			$this->subSearchExecuted = TRUE;
			return $this->queryResults($model, $returnMode);
		}
	}

    /**
     * @param $doQuery
     * @param $model
     * @param bool $returnMode
     * @return array
     */
	private function doSearch($doQuery, $model, $returnMode = FALSE) 
	{
		if($this->filterData['type']) {
			$doQuery = TRUE;
            $model = $model->where('type', $this->filterData['type']);
        }
		if(count($this->resultIds)) {
			$doQuery = TRUE;
            $model = $model->whereIn('id', $this->resultIds);
        }
		if(count($this->exludeIds)) {
			$doQuery = TRUE;
            $model = $model->whereNotIn('id', $this->exludeIds);
        }
		if($this->subSearchExecuted && count($this->resultIds) == 0) {
			$doQuery = FALSE;
		}
		if($doQuery) {
			$this->doDefaultSearch = FALSE;
			if($this->subSearchExecuted && count($this->resultIds) == 0) {
				return $this->queryResults(FALSE, $returnMode);
			}
			switch($this->filterData['order']) {
				case 'alpha':
					$model->orderBy('title');
					break;
			}
			return $this->queryResults($model, $returnMode);
		} else {
			return $this->queryResults(FALSE, $returnMode);
		}
	}

    /**
     * @param $model
     * @param bool $returnMode
     * @return array|int
     */
	private function queryResults($model, $returnMode = FALSE)
	{
		switch ($returnMode) {
			case 'getAllResults':
				return ($model) ? $model->get() : [];
				break;
			case 'count':
				return ($model) ? $model->count() : 0;
				break;
			case 'getResults':
				//dd($model->toSql());
				return ($model) ? $model->limit($this->limit)->offset($this->filterData['offset'])->get() : [];
				break;
			case 'ids':
				return ($model) ? $model->lists('id') : [];
				break;
			case 'morphId':
				return ($model) ? $model->lists('id') : [];
				break;
			case 'alpha':
				$this->resultIds = ($model) ? array_unique($model->lists('id')) : [];
				break;
			default:
				$this->resultIds = ($model) ? array_unique($model->lists('morphId')) : [];
				break;
		}
	}

    /**
     * @return mixed
     */
	private function defaultCount() 
	{
		return Morph::count();
	}

    /**
     * @return mixed
     */
	private function defaultSearch() 
	{
		return Morph::limit($this->limit)->orderBy('title', 'asc')->offset($this->filterData['offset'])->get();
	}

    /**
     * @param $results
     * @return mixed
     */
	private function getOrigin($results)
	{
		$companyIDs = [];
        $peopleIDs = [];
		
		foreach($results as $entity) {
			if($entity->type=='company') {
                $companyIDs[]= $entity->entityId;
            }
			if($entity->type == 'individual') {
            	$peopleIDs[] = $entity->entityId;
            }
		}
		
		$companies = Company::whereIn('id', $companyIDs)->where('tmp', 0)->get();
		foreach($results as $key => $entity) {
			if($entity->type != 'company') continue;
			foreach($companies as $company) {
				if($entity->entityId != $company->id) continue;
				$company->sectors = SectorsHelper::Sort($company->sectors);
				$company->expertises = ExpertisesHelper::Sort($company->expertises);
				$company->entryType = 'company';
				$results[$key] = $company;
			}
		}
		
		$people = Person::whereIn('id', $peopleIDs)->where('tmp', 0)->get();
		foreach($results as $key => $entity) {
			if($entity->type != 'individual') continue;
			foreach($people as $person) {
				if($entity->entityId != $person->id) continue;
				$person->sectors = SectorsHelper::Sort($person->sectors);
				$person->expertises = ExpertisesHelper::Sort($person->expertises);
				$person->entryType = 'individual';
				$results[$key] = $person;
			}
		}

		$trackingSearchCommunicatorsShown = [];

		foreach ($results as $key => $item) {
			if(!isset($item->entryType)) {
				unset($results[$key]);
				continue;	
			}
            $trackingSearchCommunicatorsShown[] = [
                'communicatorType' => ($item->entryType == 'company') ? 0 : 1,
                'communicatorId' => $item->id
            ];
		}

        Tracking::triggerCommunicatorsSearchShown($trackingSearchCommunicatorsShown);
		
		$user = \Auth::user()->get();
		if($user) {
			$favourites = UserFavourites::where('userId', $user->id)->get();
			foreach ($results as $key => $item) {
				foreach ($favourites as $fav) {
					if($item->entryType == $fav->type && $item->id == $fav->entityId) {
						$results[$key]->favourite = TRUE;
					}
				}
			}
		}

		return $results;
		
	}

    /**
     * @return string
     */
	private function responseRedirect() 
	{
		$params = $this->filter->getQuery();
		
		if(isset($params['offset'])) {
			$page = floor($params['offset'] / $this->limit) + 1;
			unset($params['offset']);
		}
		
		$count = 0;
		
		foreach($params as $param) {
			if(is_array($param)) {
				$count += count($param);
				continue;
			}
			$count++;
		}
		
		if($count == 1) {
			$params_routes = [
				'sectors' => 'public-search-sector',
				'expertises' => 'public-search-expertise',
				'size' => 'public-search-size'
			];
			
			foreach($params_routes as $key => $route) {
				if(!isset($params[$key])) continue;
				return route($route).'/'.( is_array($params[$key]) ? current($params[$key]) : $params[$key] ) . ( isset($page) ? '?page='.$page : '' );
			}
		}
		
		foreach($params as $key => &$param) {
			if(is_array($param)) {
				$param = $key . '=' . implode(',', $param);
			} else {
				$param = $key . '=' . $param;
			}
		}
		
		if(isset($page)) {
			$params['page'] = 'page=' . $page;
		}
		
		return route('public-search-index').( count($params) ? '?'.implode('&', $params) : '' );
	}

    /**
     * @param $results
     * @return mixed
     */
	private function responseView($results)
	{
		if(count($this->filterData['criterias']['sectors'])) {
            $sectors = SectorsHelper::GetAndSelectById($this->filterData['criterias']['sectors']);
        } else {
            $sectors = SectorsHelper::GetAndSort();
        }
		
		if(count($this->filterData['criterias']['expertises'])) {
            $expertises = ExpertisesHelper::GetAndSelectById($this->filterData['criterias']['expertises']);
        } else {
            $expertises = ExpertisesHelper::GetAndSort();
        }
		
		if(count($this->filterData['clients']['clients_sectors'])) {
            $clientSectors = SectorsHelper::GetAndSelectById($this->filterData['clients']['clients_sectors']);
        } else {
            $clientSectors = SectorsHelper::GetAndSort();
        }
		
		$sizes = Size::all();
        foreach($sizes as $size) {
            if($this->filterData['morph']['size'] == $size->id){
                $size->selected = true;
            }
        }

		$countries = Location::getCountries();
        foreach($countries as $country) {
            if($this->filterData['locations']['country'] == $country->id) {
            	$country->selected = true;
            }
        }
		
		return \View::make('search::public.results', [
        	'user' => (\Auth::user()->get()) ? TRUE : FALSE,
        	'alpha' => Morph::getAlpha(),
        	'sectors' => $sectors,
            'expertises' => $expertises,
            'sizes' => $sizes,
            'countries' => $countries,
            'states' => Location::getStates(),
            'cities' => FALSE,
            'clientSectors' => $clientSectors,
            'filter' => $this->filterData,
            'results' => $results,
        ]);
	}

    /**
     * @param $results
     * @return mixed
     */
	private function responseAjax($results)
	{
		$view = \View::make('search::public.results', [
        	'bladeExtend' => 'shared::layouts.ajax-search',
            'results' => $results,
            'route'
        ]);
        return \Response::json([
        	'url' => $this->responseRedirect(),
        	'total' => $results['total'],
            'html' => $view->render()
        ]);
	}
	
}
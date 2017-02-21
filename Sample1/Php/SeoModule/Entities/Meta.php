<?php namespace Modules\Seo\Entities;

use \Modules\Seo\Entities\MetaTypes;
use \Modules\Seo\Entities\SeoOverrides;

/**
 * Class Meta
 * @package Modules\Seo\Entities
 */
class Meta
{
	/**
	 * @var bool
	 */
	private $type;
	private $entityIdent;

	/**
	 * Meta constructor.
	 * @param bool|string $type
	 * @param bool|int|string $entityIdent
	 * @internal param bool $page
	 * @internal param bool $entityId
	 */
	function __construct($type = FALSE, $entityIdent = FALSE)
	{
		$this->type = $type;
		$this->entityIdent = $entityIdent;
	}

	/**
	 * @param bool|int $page
	 * @param bool|int $entityId
	 * @return mixed
	 */
	public static function get($page = FALSE, $entityId = FALSE)
	{
		$self = new self($page, $entityId);
		return $self->fetch();
	}

	/**
	 * @param bool $page
	 * @param bool $entityId
	 * @return string
	 */
	public static function render($page = FALSE, $entityId = FALSE)
	{
		$self = new self($page, $entityId);
		$data = $self->fetch();
		return \View::make('shared::chunks.meta', [
			'data' => $self->getHtml($data)
		])->render();
	}

	/**
	 * @return array
	 */
	private function fetch()
	{
		$global_meta = $this->getGlobals();
		$route_meta = $this->fetchMetaByRoute();
		$overrides_meta = $this->getOverrides();
		$meta = [];
		
		if ($this->type) {
			$meta = $this->fetchMetaByPageType($this->type, $this->entityIdent);
		}
		
		$meta = array_replace_recursive($global_meta, $route_meta, $meta, $overrides_meta);
		
		$meta = $this->prepareMeta($meta);

		return $meta;
	}

	/**
	 * @param bool|string $type
	 * @param bool|int|string $ident
	 * @param array $meta
	 * @return array
	 */
	private function fetchMetaByPageType($type, $ident, $meta = [])
	{
		return $meta;
	}

	/**
	 * @param array $meta
	 * @return array
	 */
	private function fetchMetaByRoute($meta = [])
	{
		$route = \Route::getCurrentRoute()->getName();
		switch ($route) {
			case 'public-companies-profile-slug':
				$config = \Config::get('seo.meta_pages_types.communicator');
				$entitySlug = \Request::segment(2);
				$meta = MetaTypes::fetchCompany($entitySlug);
				$meta = array_replace($config, $meta);
				break;

			case 'public-people-profile-slug':
				$config = \Config::get('seo.meta_pages_types.communicator');
				$entitySlug = \Request::segment(2);
				$meta = MetaTypes::fetchIndividual($entitySlug);
				$meta = array_replace($config, $meta);
				break;

			case 'public-search-sector-slug':
				$entitySlug = \Request::segment(2);
				$meta = MetaTypes::fetchSector($entitySlug);
				break;

			case 'public-search-expertise-slug':
				$entitySlug = \Request::segment(2);
				$meta = MetaTypes::fetchExpertise($entitySlug);
				break;

			case 'public-papers-view-slug':
				$entitySlug = \Request::segment(3);
				$meta = MetaTypes::fetchInsights($entitySlug);
				break;

			default:
				$routes_meta = \Config::get('seo.meta_routes');
				if (isset($routes_meta[$route])) {
					$meta = $routes_meta[$route];
				}
				break;
		}
		return $meta;
	}

	/**
	 * @return array
	 */
	private function getGlobals()
	{
		return \Config::get('seo.meta_global.global');
	}

	/**
	 * @return array
	 */
	private function getOverrides()
	{
		$route = \Request::path();
		if (strpos($route, '/') !== 0) {
			$route = '/' . $route;
		}
		$overrides = SeoOverrides::select(['title', 'description', 'keywords'])->where('slug', $route)->first();
		if ($overrides) {
			return $overrides->toArray();
		}
		return [];
	}

	/**
	 * @param array $data
	 * @return array
	 */
	private function prepareMeta($data)
	{
		$data['description'] = $this->stripDescription($data['description']);
		$data['keywords'] = $this->stripKeywords($data['keywords']);

		$props_to_add_suffix = \Config::get('seo.meta_global.props_to_add_suffix');
		foreach ($props_to_add_suffix as $prop) {
			if (!isset($data[$prop]) || $data[$prop] == '') continue;
			$data[$prop] = trim($data[$prop]) . \Config::get('seo.meta_global.suffix');
		}

		foreach ($data as $key => $value) {
			if (is_array($value)) continue;
			$data[$key] = trim($value);
		}
		
		return $data;
	}

	/**
	 * @param string $text
	 * @param int $limit
	 * @return string
	 */
	private function stripDescription($text, $limit = 250)
	{
		$words = explode(' ', strip_tags($text));
		$words_array = [];

		foreach ($words as $word) {
			if ($word == null) continue;
			$words_array[] = trim($word);
		}

		$result = '';

		foreach ($words_array as $word) {
			$count_desc = iconv_strlen($result);
			$count_word = iconv_strlen($word);
			if (($count_desc + $count_word) > $limit) break;
			$result .= $word . ' ';
		}

		return trim($result);
	}

	/**
	 * @param string $keywords
	 * @return string
	 */
	private function stripKeywords($keywords)
	{
		$result = [];
		if (is_array($keywords)) {
			foreach ($keywords as $word) {
				$result[] = trim($word);
			}
		} else {
			$result[] = trim($keywords);
		}

		return implode(', ', $result);
	}

	/**
	 * @param array $data
	 * @return array
	 */
	private function getHtml($data = [])
	{
		foreach ($data as $key => $value) {
			if (is_array($value)) {
				unset($data[$key]);
				continue;
			}
			switch (TRUE) {
				case ($key == 'title'):
					$data[$key] = '<title>'.$value.'</title>';
					break;
				case (strpos($key, 'og:') === 0):
					$data[$key] = '<meta property="'.$key.'" content="'.$value.'" />';
					break;
				default:
					$data[$key] = '<meta name="'.$key.'" content="'.$value.'" />';
					break;
			}
		}
		return $data;
	}

}
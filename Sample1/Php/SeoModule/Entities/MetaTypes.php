<?php namespace Modules\Seo\Entities;

use Modules\Seo\Helpers\SocialHelper;

use Modules\Companies\Entities\Company;
use Modules\Companies\Entities\CompanyInfo;

use Modules\People\Entities\Person;
use Modules\People\Entities\PersonInfo;
use Modules\People\Entities\PersonCompany;

use Modules\Companies\Entities\Sector;
use Modules\Companies\Entities\Expertise;

use Modules\Papers\Entities\Papers;

/**
 * Class MetaTypes
 * @package Modules\Seo\Entities
 */
class MetaTypes {

	/**
	 * @param null|int|string $ident
	 * @return array
	 */
	public static function fetchCompany($ident = null)
	{
		if (is_numeric($ident)) {
			$company = Company::where('id', $ident)->first();
		} else {
			$company = Company::where('slug', $ident)->first();
		}
		
		if(!$company) {
			return [];
		}

		$info = CompanyInfo::where('companyId', $company->id)->first();

		$keywords = [];
		if ($info->keywords != '') {
			$keywords[] = $info->keywords;
		}
		$keywords[] = $company->name;

		$sectors = $company->sectors()->get();
		foreach ($sectors as $sector) {
			$keywords[] = $sector->name;
		}

		$expertises = $company->expertises()->get();
		foreach ($expertises as $expertise) {
			$keywords[] = $expertise->name;
		}

		$size = $company->size()->first();
		if ($size) {
			$keywords[] = $size->name;
		}
		
		return [
			'title' => $company->name,
			'description' => strip_tags($info->additionalNotes),
			'keywords' => $keywords,
			// FACEBOOK META
			'og:title' => $company->name,
			'og:url' => route('public-companies-profile') . '/' . $company->slug,
			'og:image' => url('/thumbs' . config('companies.upload_path') . $company->image . '?resize=600,600&resizeCanvas=1200,628'),
			// TWITTER META
			'twitter:title' => $company->name,
			'twitter:image' => url('/thumbs' . config('companies.upload_path') . $company->image . '?resize=500,500&resizeCanvas=1024,512'),
			
			'share' => [
				'source' => route('public-companies-profile') . '/' . $company->slug,
				'title' => $company->name,
			]
		];
	}

	/**
	 * @param null|int|string $ident
	 * @return array
	 */
	public static function fetchIndividual($ident = null)
	{
		if (is_numeric($ident)) {
			$person = Person::where('id', $ident)->first();
		} else {
			$person = Person::where('slug', $ident)->first();
		}

		if (!$person) {
			return [];
		}

		$info = PersonInfo::where('personId', $person->id)->first();

		$company = PersonCompany::where('personId', '=', $person->id)->first();

		$keywords = [];
		if ($info->keywords != '') {
			$keywords[] = $info->keywords;
		}

		$keywords[] = $person->firstName . ' ' . $person->lastName;

		$keywords[] = $company->name;

		$sectors = $person->sectors()->get();
		foreach ($sectors as $sector) {
			$keywords[] = $sector->name;
		}

		$expertises = $person->expertises()->get();
		foreach ($expertises as $expertise) {
			$keywords[] = $expertise->name;
		}

		return [
			'title' => $person->firstName . ' ' . $person->lastName . ' - ' . $company->name,
			'description' => strip_tags($info->additionalNotes),
			'keywords' => $keywords,
			// FACEBOOK META
			'og:title' => $person->firstName . ' ' . $person->lastName . ' - ' . $company->name,
			'og:url' => route('public-people-profile') . '/' . $person->slug,
			'og:image' => url('/thumbs' . config('people.upload_path') . $person->image . '?resize=600,600&resizeCanvas=1200,628'),
			// TWITTER META
			'twitter:title' => $person->firstName . ' ' . $person->lastName . ' - ' . $company->name,
			'twitter:image' => url('/thumbs' . config('people.upload_path') . $person->image . '?resize=500,500&resizeCanvas=1024,512'),

			'share' => [
				'source' => route('public-people-profile') . '/' . $person->slug,
				'title' => $person->firstName . ' ' . $person->lastName . ' - ' . $company->name,
			]
		];
	}

	/**
	 * @param null|int|string $ident
	 * @return array
	 */
	public static function fetchInsights($ident = null)
	{
		if (is_numeric($ident)) {
			$paper = Papers::where('id', $ident)->first();
		} else {
			$paper = Papers::where('slug', $ident)->first();
		}

		if (!$paper) {
			return [];
		}
		
		$url = '';

		$html = new \DOMDocument();
		libxml_use_internal_errors(true);
		$html->loadHTML($paper->description);
		libxml_clear_errors();
		$tags = $html->getElementsByTagName('img');
		foreach ($tags as $tag) {
			$url = $tag->getAttribute('src');
			break;
		}	
		
		return [
			'title' => $paper->title,
			'description' => $paper->shortDesc,
			'keywords' => $paper->keywords,
			// FACEBOOK META
			'og:title' => $paper->title,
			'og:description' => $paper->shortDesc,
			'og:url' => route('public-papers-view') . '/' . (($paper->communicatorType) ? 'company' : 'individual') . '/' . $paper->slug,
			'og:image' => $url,
			// TWITTER META
			'twitter:title' => $paper->title,
			'twitter:description' => $paper->shortDesc,
			'twitter:image' => $url,

			'share' => [
				'source' => route('public-papers-view') . '/' . (($paper->communicatorType) ? 'company' : 'individual') . '/' . $paper->slug,
				'title' => $paper->title,
			]
		];
	}

	/**
	 * @param null|int|string $ident
	 * @return array
	 */
	public static function fetchSector($ident = null)
	{
		if (is_numeric($ident)) {
			$sector = Sector::where('id', $ident)->first();
		} else {
			$sector = Sector::where('slug', $ident)->first();
		}

		if (!$sector) {
			return [];
		}
		
		return [
			'title' => 'Top professionals in ' . $sector->name . ' sector',
			'description' => 'Look for professionals in ' . $sector->name . ' sector? Find professionals on CommunicationsMatch. We can help you to find ' . $sector->name,
			'keywords' => $sector->name . ', ' . $sector->name . ' professionals, CommunicationsMatch',
			// FACEBOOK META
			'og:title' => 'Top professionals in ' . $sector->name . ' sector',
			'og:description' => 'Look for professionals in ' . $sector->name . ' sector? Find professionals on CommunicationsMatch. We can help you to find ' . $sector->name,
			'og:url' => route('public-search-sector') . '/' . $sector->slug,
			// TWITTER META
			'twitter:title' => 'Top professionals in ' . $sector->name . ' sector',
			'twitter:description' => 'Look for professionals in ' . $sector->name . ' sector? Find professionals on CommunicationsMatch. We can help you to find ' . $sector->name,
		
			'share' => [
				'source' => route('public-search-sector') . '/' . $sector->slug,
				'title' => 'Top professionals in ' . $sector->name . ' sector',
			]
		];
	}

	/**
	 * @param null|int|string $ident
	 * @return array
	 */
	public static function fetchExpertise($ident = null)
	{
		if (is_numeric($ident)) {
			$expertise = Expertise::where('id', $ident)->first();
		} else {
			$expertise = Expertise::where('slug', $ident)->first();
		}

		if (!$expertise) {
			return [];
		}

		return [
			'title' => 'Top professionals in ' . $expertise->name . ' area',
			'description' => 'Look for professionals in ' . $expertise->name . ' area? Find professionals on CommunicationsMatch. We can help you to find ' . $expertise->name,
			'keywords' => $expertise->name . ', ' . $expertise->name . ' professionals, CommunicationsMatch',
			// FACEBOOK META
			'og:title' => 'Top professionals in ' . $expertise->name . ' area',
			'og:description' => 'Look for professionals in ' . $expertise->name . ' area? Find professionals on CommunicationsMatch. We can help you to find ' . $expertise->name,
			'og:url' => route('public-search-expertise') . '/' . $expertise->slug,
			// TWITTER META
			'twitter:title' => 'Top professionals in ' . $expertise->name . ' area',
			'twitter:description' => 'Look for professionals in ' . $expertise->name . ' area? Find professionals on CommunicationsMatch. We can help you to find ' . $expertise->name,

			'share' => [
				'source' => route('public-search-expertise') . '/' . $expertise->slug,
				'title' => 'Top professionals in ' . $expertise->name . ' area',
			]
		];
	}
	
}
<?php namespace Modules\Seo\Entities;
   
use Illuminate\Database\Eloquent\Model;

/**
 * Class SeoOverrides
 * @package Modules\Seo\Entities
 */
class SeoOverrides extends Model {

    protected $table = 'seo_overrides';
    protected $fillable = ['slug', 'title', 'description', 'keywords'];

}
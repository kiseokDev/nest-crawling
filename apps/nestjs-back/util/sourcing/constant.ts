import { SourcingInfo } from './sourcing.interface';

export const DOMEME_CRAWL_INFO: DoememeSourcingInfoType = {
  loginUrl: 'https://www.domeme.co.kr/login',
  url: 'https://www.domeme.co.kr',
  searchUrl: 'https://www.domeme.co.kr/search?q=',
  productName: 'div.product-item__title',
  productUrl: 'a.product-item__link',
  price: 'span.product-item__price',
  description: 'div.product-item__description',
  images: ['img.product-item__image'],
};

export type DoememeSourcingInfoType = SourcingInfo & {
  loginUrl: string;
  url: string;
  searchUrl: string;
  productName: string;
  productUrl: string;
  price: string;
  description: string;
  images: string[];
};
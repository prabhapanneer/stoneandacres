import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuestGuard } from '../../guards/guest.guard';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: '', loadChildren: () => import('../../views/home/home.module').then(m => m.HomeModule) },

      { path: 'search', loadChildren: () => import('../../views/search/search.module').then(m => m.SearchModule) },
      { path: 'account', loadChildren: () => import('../../views/account/account.module').then(m => m.AccountModule) },
      { path: 'guest-login', loadChildren: () => import('../../views/guest-login/guest-login.module').then(m => m.GuestLoginModule), canActivate: [GuestGuard] },
      { path: 'wishlist', loadChildren: () => import('../../views/wish-list/wish-list.module').then(m => m.WishListModule) },
      { path: 'cart', loadChildren: () => import('../../views/cart/cart.module').then(m => m.CartModule) },

      { path: 'category', loadChildren: () => import('../../views/category/category.module').then(m => m.CategoryModule) },
      { path: 'vendor', loadChildren: () => import('../../views/category/category.module').then(m => m.CategoryModule) },
      { path: 'recommended-products', loadChildren: () => import('../../views/category/category.module').then(m => m.CategoryModule) },
      { path: 'on-sale', loadChildren: () => import('../../views/category/category.module').then(m => m.CategoryModule) },
      { path: 'featured-products', loadChildren: () => import('../../views/category/category.module').then(m => m.CategoryModule) },
      { path: 'all-products', loadChildren: () => import('../../views/category/category.module').then(m => m.CategoryModule) },
      { path: 'new-arrivals', loadChildren: () => import('../../views/category/category.module').then(m => m.CategoryModule) },

      { path: 'product', loadChildren: () => import('../../views/product/product.module').then(m => m.ProductModule) },
      
      { path: 'gift-cards', loadChildren: () => import('../../views/features/gift-cards/gift-cards.module').then(m => m.GiftCardsModule) },
      { path: 'blogs', loadChildren: () => import('../../views/features/blogs/blogs.module').then(m => m.BlogsModule) },
      { path: 'recipes', loadChildren: () => import('../../views/features/recipes/recipes.module').then(m => m.RecipesModule) },
      { path: 'catalog-page', loadChildren: () => import('../../views/features/catalog-page/catalog-page.module').then(m => m.CatalogPageModule) },
      { path: 'brands', loadChildren: () => import('../../views/features/collections/collections.module').then(m => m.CollectionsModule) },
      { path: 'services', loadChildren: () => import('../../views/features/appointment/appointment.module').then(m => m.AppointmentModule) },
      { path: 'service-confirmed/:id', loadChildren: () => import('../../views/features/appointment/service-placed/service-placed.module').then(m => m.ServicePlacedModule) },
      { path: 'sizing-assistant/:id', loadChildren: () => import('../../views/features/sizing-assistant/sizing-assistant.module').then(m => m.SizingAssistantModule) },
      { path: 'order-review/:id', loadChildren: () => import('../../views/features/order-review/order-review.module').then(m => m.OrderReviewModule) },
      
      { path: 'contact-us', loadChildren: () => import('../../views/properties/contact-us/contact-us.module').then(m => m.ContactUsModule) },
      { path: 'store-locator', loadChildren: () => import('../../views/properties/store-locator/store-locator.module').then(m => m.StoreLocatorModule) },
      { path: 'privacy-policy', loadChildren: () => import('../../views/properties/policy/policy.module').then(m => m.PolicyModule) },
      { path: 'shipping-policy', loadChildren: () => import('../../views/properties/policy/policy.module').then(m => m.PolicyModule) },
      { path: 'cancellation-policy', loadChildren: () => import('../../views/properties/policy/policy.module').then(m => m.PolicyModule) },
      { path: 'terms-and-conditions', loadChildren: () => import('../../views/properties/policy/policy.module').then(m => m.PolicyModule) },
      { path: 'pages/:type', loadChildren: () => import('../../views/properties/extra-page/extra-page.module').then(m => m.ExtraPageModule) },
      { path: 'quote-status/:quot_id/:type', loadChildren: () => import('../../views/quote-status/quote-status.module').then(m => m.QuoteStatusModule) },

      { path: 'aboutus', loadChildren: () => import('../../views/properties/about-us/about-us.module').then(m => m.AboutUsModule) },
      { path: 'our-services', loadChildren: () => import('../../views/properties/our-services/our-services.module').then(m => m.OurServicesModule) },
      { path: 'land-owners', loadChildren:() => import('../../views/properties/land-owners/land-owners.module').then(m => m.LandOwnersModule) },
      { path: 'customers', loadChildren:() => import('../../views/properties/customers/customers.module').then(m => m.CustomersModule) },
      { path: 'referral', loadChildren:() => import('../../views/properties/referral/referral.module').then(m => m.ReferralModule) },

      { path: 'vendor-enquiry', loadChildren: () => import('../../views/vendor/vendor-enquiry/vendor-enquiry.module').then(m => m.VendorEnquiryModule) },
      { path: 'vendor-register', loadChildren: () => import('../../views/vendor/vendor-register/vendor-register.module').then(m => m.VendorRegisterModule) },
      { path: 'vendor-login', loadChildren: () => import('../../views/vendor/vendor-login/vendor-login.module').then(m => m.VendorLoginModule) },

      { path: '404', loadChildren: () => import('../../views/not-found/not-found.module').then(m => m.NotFoundModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MainRoutingModule { }
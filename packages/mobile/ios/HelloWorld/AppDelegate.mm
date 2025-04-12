#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"vicimobile"
                                            initialProperties:nil];

  rootView.backgroundColor = [UIColor whiteColor];
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
  // Always use the pre-bundled file to avoid Metro issues
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  
  // Original code (commented out)
  /*
  #if DEBUG
  // Use explicit host and port 8081 for Metro
  RCTBundleURLProvider *bundleURLProvider = [RCTBundleURLProvider sharedSettings];
  bundleURLProvider.jsLocation = @"localhost:8081";
  return [bundleURLProvider jsBundleURLForBundleRoot:@"index"];
  #else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  #endif
  */
}

@end

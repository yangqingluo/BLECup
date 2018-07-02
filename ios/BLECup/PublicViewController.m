//
//  PublicViewController.m
//  ShipGoods
//
//  Created by 7kers on 2018/5/28.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "PublicViewController.h"

@interface PublicViewController ()

@end

@implementation PublicViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
  [super touchesBegan:touches withEvent:event];
  [self dismissKeyboard];
}

- (void)dismissKeyboard {
  [self.view endEditing:YES];
}

@end

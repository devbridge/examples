//  ViewController.m
//  SantaFace
//
//  Created by Tadas Z on 11/30/12.
//  DevBridge

#import "ViewController.h"
#import "DetectFace.h"

@interface ViewController () <DetectFaceDelegate>

@property (weak, nonatomic) IBOutlet UIView *previewView;
@property (strong, nonatomic) DetectFace *detectFaceController;

@property (nonatomic, strong) UIImageView *hatImgView;
@property (nonatomic, strong) UIImageView *beardImgView;
@property (nonatomic, strong) UIImageView *mustacheImgView;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    
    self.detectFaceController = [[DetectFace alloc] init];
    self.detectFaceController.delegate = self;
    self.detectFaceController.previewView = self.previewView;
    [self.detectFaceController startDetection];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillUnload
{
    [self.detectFaceController stopDetection];
    [super viewWillUnload];
}

- (void)viewDidUnload {
    [self setPreviewView:nil];
    [super viewDidUnload];
}

- (void)detectedFaceController:(DetectFace *)controller features:(NSArray *)featuresArray forVideoBox:(CGRect)clap withPreviewBox:(CGRect)previewBox
{
    if (!self.beardImgView) {
        self.beardImgView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"beard"]];
        self.beardImgView.contentMode = UIViewContentModeScaleToFill;
        [self.previewView addSubview:self.beardImgView];
    }
    
    if (!self.mustacheImgView) {
        self.mustacheImgView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"mustache"]];
        self.mustacheImgView.contentMode = UIViewContentModeScaleToFill;
        [self.previewView addSubview:self.mustacheImgView];
    }
    
    if (!self.hatImgView) {
        self.hatImgView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"christmas_hat"]];
        self.hatImgView.contentMode = UIViewContentModeScaleToFill;
        [self.previewView addSubview:self.hatImgView];
    }
    
    for (CIFaceFeature *ff in featuresArray) {
        // find the correct position for the square layer within the previewLayer
        // the feature box originates in the bottom left of the video frame.
        // (Bottom right if mirroring is turned on)
        CGRect faceRect = [ff bounds];
        
        //isMirrored because we are using front camera
        faceRect = [DetectFace convertFrame:faceRect previewBox:previewBox forVideoBox:clap isMirrored:YES];
        
        float hat_width = 290.0;
        float hat_height = 360.0;
        float head_start_y = 150.0; //part of hat image is transparent
        float head_start_x = 78.0;
        
        float width = faceRect.size.width * (hat_width / (hat_width - head_start_x));
        float height = width * hat_height/hat_width;
        float y = faceRect.origin.y - (height * head_start_y) / hat_height;
        float x = faceRect.origin.x - (head_start_x * width/hat_width);
        [self.hatImgView setFrame:CGRectMake(x, y, width, height)];
        
        float beard_width = 192.0;
        float beard_height = 171.0;
        width = faceRect.size.width * 0.6;
        height = width * beard_height/beard_width;
        y = faceRect.origin.y + faceRect.size.height - (80 * height/beard_height);
        x = faceRect.origin.x + (faceRect.size.width - width)/2;
        [self.beardImgView setFrame:CGRectMake(x, y, width, height)];
        
        float mustache_width = 212.0;
        float mustache_height = 58.0;
        width = faceRect.size.width * 0.9;
        height = width * mustache_height/mustache_width;
        y = y - height + 5;
        x = faceRect.origin.x + (faceRect.size.width - width)/2;        
        [self.mustacheImgView setFrame:CGRectMake(x, y, width, height)];
    }
}

@end

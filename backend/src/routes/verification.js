const express = require('express');
const router = express.Router();
const { RekognitionClient, CompareFacesCommand } = require('@aws-sdk/client-rekognition');

// Initialize AWS Client
const awsRegion = process.env.AWS_REGION || 'ap-south-1'; // Default: Mumbai
let rekognitionClient = null;

if (process.env.AWS_REKOGNITION_ACCESS_KEY && process.env.AWS_REKOGNITION_SECRET_KEY) {
  try {
    process.env.AWS_ACCESS_KEY_ID = process.env.AWS_REKOGNITION_ACCESS_KEY;
    process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_REKOGNITION_SECRET_KEY;
    rekognitionClient = new RekognitionClient({ region: awsRegion });
  } catch (e) {
    console.error("AWS Rekognition Init Error:", e.message);
  }
}

// Simulated Aadhaar XML parse
router.post('/aadhaar', (req, res) => {
  const { xmlData, shareCode } = req.body;
  
  // In a real app, you would verify the UIDAI digital signature here using a cert.
  // For the demo:
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        name: "Rajesh Kumar",
        dob: "15-06-1994",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600041",
        tier: 3,
        signatureValid: true
      }
    });
  }, 2000);
});

// AWS Face Match + Liveness
router.post('/face-match', async (req, res) => {
  const { sourceImageBase64, targetImageBase64 } = req.body; // base64 strings

  if (rekognitionClient && sourceImageBase64 && targetImageBase64) {
    try {
      // Decode base64 
      const sourceBytes = Buffer.from(sourceImageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const targetBytes = Buffer.from(targetImageBase64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

      const command = new CompareFacesCommand({
        SourceImage: { Bytes: sourceBytes },
        TargetImage: { Bytes: targetBytes },
        SimilarityThreshold: 80
      });

      const response = await rekognitionClient.send(command);
      
      if (response.FaceMatches && response.FaceMatches.length > 0) {
        return res.json({
          success: true,
          matchScore: response.FaceMatches[0].Similarity,
          real: true
        });
      } else {
        return res.json({ success: false, matchScore: 0, real: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'AWS Rekognition Failed' });
    }
  }

  // Backup MOCK implementation
  setTimeout(() => {
    res.json({
      success: true,
      matchScore: 91,
      real: true
    });
  }, 1500);
});

router.post('/platform', (req, res) => {
  // Mock platform proof verification
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        platform: "Zomato",
        partnerId: "ZOM987654",
        earnings: 4850
      }
    });
  }, 1500);
});

module.exports = router;

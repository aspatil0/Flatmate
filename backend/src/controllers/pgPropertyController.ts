import { Request, Response } from 'express';
import PGProperty from '../models/PGProperty.js';
import PGOwner from '../models/PGOwner.js';

// Create a new PG property
export const createProperty = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    const { name, description, address, city, location, totalBeds, pricePerBed, amenities, images, rules } = req.body;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!name || !description || !address || !city || !location || !totalBeds || !pricePerBed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const property = new PGProperty({
      owner: pgOwnerId,
      name,
      description,
      address,
      city,
      location,
      totalBeds,
      availableBeds: totalBeds,
      pricePerBed,
      amenities: amenities || [],
      images: images || [],
      rules: rules || null,
    });

    await property.save();

    // Add property to owner's properties array
    await PGOwner.findByIdAndUpdate(pgOwnerId, { $push: { properties: property._id } });

    res.status(201).json({
      message: 'Property created successfully',
      property: {
        id: property._id,
        name: property.name,
        city: property.city,
        location: property.location,
        totalBeds: property.totalBeds,
        availableBeds: property.availableBeds,
        pricePerBed: property.pricePerBed,
      },
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all properties for a PG owner
export const getOwnerProperties = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const properties = await PGProperty.find({ owner: pgOwnerId });

    res.json({
      properties,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all available properties for tenants
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const { city, search } = req.query;

    let query: any = {};

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    console.log('=== getAllProperties Debug ===');
    console.log('Query filters:', query);
    
    const properties = await PGProperty.find(query)
      .populate('owner', 'name email phone companyName')
      .sort({ createdAt: -1 });

    console.log(`Found ${properties.length} properties`);
    
    if (properties.length > 0) {
      console.log('Sample property:', JSON.stringify(properties[0], null, 2));
    }

    res.json({
      properties: properties || [],
      count: properties.length,
      query: query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('=== Error in getAllProperties ===');
    console.error('Error object:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
};

// Get single property details
export const getPropertyDetails = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    const property = await PGProperty.findById(propertyId).populate('owner', 'name email phone companyName location');

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      property,
    });
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    const { propertyId } = req.params;
    const { name, description, address, city, location, totalBeds, availableBeds, pricePerBed, amenities, images, rules } = req.body;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const property = await PGProperty.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.owner.toString() !== pgOwnerId) {
      return res.status(403).json({ error: 'Not authorized to update this property' });
    }

    const updatedProperty = await PGProperty.findByIdAndUpdate(
      propertyId,
      {
        $set: {
          ...(name && { name }),
          ...(description && { description }),
          ...(address && { address }),
          ...(city && { city }),
          ...(location && { location }),
          ...(totalBeds && { totalBeds }),
          ...(availableBeds !== undefined && { availableBeds }),
          ...(pricePerBed && { pricePerBed }),
          ...(amenities && { amenities }),
          ...(images && { images }),
          ...(rules && { rules }),
        },
      },
      { new: true }
    );

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty,
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const pgOwnerId = (req as any).pgOwnerId;
    const { propertyId } = req.params;

    if (!pgOwnerId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const property = await PGProperty.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.owner.toString() !== pgOwnerId) {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    await PGProperty.findByIdAndDelete(propertyId);
    await PGOwner.findByIdAndUpdate(pgOwnerId, { $pull: { properties: propertyId } });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

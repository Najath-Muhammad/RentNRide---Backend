export async function generateBookingId(this: any): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this._bookingRepo.countDocuments({
      createdAt: { $gte: new Date(`${year}-01-01`) } as any,
    });
    return `BK-${year}-${(count + 1).toString().padStart(5, '0')}`;
}
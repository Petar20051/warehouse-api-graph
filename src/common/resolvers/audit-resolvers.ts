import { createAuditResolver } from './base-audit.resolver';

import { CompanyType } from 'src/company/company.types';
import { UserType } from 'src/user/user.types';
import { ProductType } from 'src/product/product.types';
import { WarehouseType } from 'src/warehouse/warehouse.types';
import { PartnerType } from 'src/partner/partner.types';
import { OrderType } from 'src/order/order.types';
import { OrderItemType } from 'src/orderItem/orderItem.types';
import { InvoiceType } from 'src/invoice/invoice.types';

export const CompanyAuditResolver = createAuditResolver(CompanyType);
export const UserAuditResolver = createAuditResolver(UserType);
export const ProductAuditResolver = createAuditResolver(ProductType);
export const WarehouseAuditResolver = createAuditResolver(WarehouseType);
export const PartnerAuditResolver = createAuditResolver(PartnerType);
export const OrderAuditResolver = createAuditResolver(OrderType);
export const OrderItemAuditResolver = createAuditResolver(OrderItemType);
export const InvoiceAuditResolver = createAuditResolver(InvoiceType);

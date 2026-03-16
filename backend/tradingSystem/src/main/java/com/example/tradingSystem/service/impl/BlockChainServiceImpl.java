package com.example.tradingSystem.service.impl;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import com.alibaba.fastjson.JSONObject;
import com.example.tradingSystem.common.Constant;
import com.example.tradingSystem.domain.Commodity.Commodity;
import com.example.tradingSystem.domain.Trade.Account;
import com.example.tradingSystem.domain.Trade.Trade;
import com.example.tradingSystem.domain.User.Business;
import com.example.tradingSystem.domain.User.Customer;
import com.example.tradingSystem.domain.User.Superviser;
import com.example.tradingSystem.domain.User.User;
import com.example.tradingSystem.entry.blockchain.BlockChainMapper;
import com.example.tradingSystem.service.BlockChainService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
public class BlockChainServiceImpl implements BlockChainService{

    @Autowired 
    private BlockChainMapper mapper;

    @Value("${trading.mock.enabled:true}")
    private boolean mockEnabled;

    private final Map<String, Superviser> mockSupervisers = new HashMap<>();
    private final Map<String, Business> mockBusinesses = new HashMap<>();
    private final Map<String, Customer> mockCustomers = new HashMap<>();
    private final Map<String, Commodity> mockCommodities = new HashMap<>();
    private final CopyOnWriteArrayList<Trade> mockTrades = new CopyOnWriteArrayList<>();

    @Override
    public Superviser getSuperviserOnChain(String id) {
        if (mockEnabled) {
            return mockSupervisers.get(Constant.PREFIX_ID_SUPERVISER + id);
        }
        return mapper.getSuperviser(id);
    }

    @Override
    public Business getBussinessOnChain(String id) {
        if (mockEnabled) {
            return mockBusinesses.get(Constant.PREFIX_ID_BUSSINIESSMAN + id);
        }
        return mapper.getBusiness(id);
    }
    
    @Override
    public Customer getCustomerOnChain(String id) {
        if (mockEnabled) {
            return mockCustomers.get(Constant.PREFIX_ID_CUSTOMER + id);
        }
        return mapper.getCustomer(id);
    }

    @Override
    public Boolean userExist(String id, Integer role) {
        if (mockEnabled) {
            if (role == Constant.ROLE_TYPE_SUPERVISER) {
                return mockSupervisers.containsKey(Constant.PREFIX_ID_SUPERVISER + id);
            }
            if (role == Constant.ROLE_TYPE_CUSTOMER) {
                return mockCustomers.containsKey(Constant.PREFIX_ID_CUSTOMER + id);
            }
            return mockBusinesses.containsKey(Constant.PREFIX_ID_BUSSINIESSMAN + id);
        }
        if (role == Constant.ROLE_TYPE_SUPERVISER){
            id = Constant.PREFIX_ID_SUPERVISER + id;
            return mapper.DataOnChainCheck(id);
        
        }else if(role == Constant.ROLE_TYPE_CUSTOMER){
            id = Constant.PREFIX_ID_CUSTOMER + id;
            return mapper.DataOnChainCheck(id);

        }else{
            id = Constant.PREFIX_ID_BUSSINIESSMAN + id;
            return mapper.DataOnChainCheck(id);
        }
    }

    @Override
    public Boolean userExist(String id) {
        if (mockEnabled) {
            return mockSupervisers.containsKey(id) || mockBusinesses.containsKey(id) || mockCustomers.containsKey(id);
        }
        return mapper.DataOnChainCheck(id);
    }

    @Override
    public Boolean userRegister(User user) {
        if (mockEnabled) {
            Integer roleType = user.getRole();
            String now = String.valueOf(System.currentTimeMillis());
            if (roleType == Constant.ROLE_TYPE_SUPERVISER) {
                Superviser sup = new Superviser();
                sup.setId(Constant.PREFIX_ID_SUPERVISER + user.getAccount());
                sup.setName(user.getName());
                sup.setState(true);
                sup.setLastUpdateTime(now);
                mockSupervisers.put(sup.getId(), sup);
                return true;
            }
            if (roleType == Constant.ROLE_TYPE_BUSSINESS) {
                Business bus = new Business();
                bus.setId(Constant.PREFIX_ID_BUSSINIESSMAN + user.getAccount());
                bus.setName(user.getName());
                bus.setPhone(user.getAccount());
                bus.setBalance(0);
                bus.setState(true);
                bus.setCurrency("0001");
                bus.setLastUpdateTime(now);
                bus.setCommodityIdList(new ArrayList<>());
                mockBusinesses.put(bus.getId(), bus);
                return true;
            }
            if (roleType == Constant.ROLE_TYPE_CUSTOMER) {
                Customer cus = new Customer();
                cus.setId(Constant.PREFIX_ID_CUSTOMER + user.getAccount());
                cus.setName(user.getName());
                cus.setPhone(user.getAccount());
                cus.setBalance(0);
                cus.setState(true);
                cus.setCurrency("0001");
                cus.setLastUpdateTime(now);
                cus.setCommodityIdList(new ArrayList<>());
                mockCustomers.put(cus.getId(), cus);
                return true;
            }
            return false;
        }
        Integer roleType = user.getRole();
        if (roleType == Constant.ROLE_TYPE_SUPERVISER){
            return superviserRegister(user);
        }
        if (roleType == Constant.ROLE_TYPE_BUSSINESS){
            return businessRegister(user);
        }
        if (roleType == Constant.ROLE_TYPE_CUSTOMER){
            return customerRegister(user);
        }
        log.error("role type not exist");
        return false;
    }

    private Boolean superviserRegister(User user){
        String account = user.getAccount();
        String name = user.getName();
        String phone = user.getAccount();
        return mapper.createSuperviser(account, name, phone);
    }

    private Boolean businessRegister(User user){
        String account = user.getAccount();
        String name = user.getName();
        String phone = user.getAccount();
        return mapper.createBusiness(account, name, phone);
    }
    
    private Boolean customerRegister(User user){
        String account = user.getAccount();
        String name = user.getName();
        String phone = user.getAccount();
        return mapper.createCustomer(account, name, phone);
    }

    @Override
    public String getUserNameById(String id) {
        if (mockEnabled) {
            if (id.startsWith(Constant.PREFIX_ID_SUPERVISER) && mockSupervisers.containsKey(id)) {
                return mockSupervisers.get(id).getName();
            }
            if (id.startsWith(Constant.PREFIX_ID_BUSSINIESSMAN) && mockBusinesses.containsKey(id)) {
                return mockBusinesses.get(id).getName();
            }
            if (id.startsWith(Constant.PREFIX_ID_CUSTOMER) && mockCustomers.containsKey(id)) {
                return mockCustomers.get(id).getName();
            }
            return "unknown";
        }
        String name = "";
        if (id.startsWith(Constant.PREFIX_ID_SUPERVISER)){
            Superviser sup = getSuperviserOnChain(id.substring(4));
            name = sup.getName();
        }else if(id.startsWith(Constant.PREFIX_ID_BUSSINIESSMAN)){
            Business bus = getBussinessOnChain(id.substring(4));
            name = bus.getName();
        }else if(id.startsWith(Constant.PREFIX_ID_CUSTOMER)){
            Customer cus = getCustomerOnChain(id.substring(4));
            name = cus.getName();
        }
        return name;
    }


    @Override
    public JSONObject getUserInfoOnChain(String id, Integer role) {
        if (mockEnabled) {
            JSONObject jsonObj = new JSONObject();
            if (role == Constant.ROLE_TYPE_SUPERVISER) {
                jsonObj.put("role", Constant.ROLE_TYPE_SUPERVISER);
                jsonObj.put("user", mockSupervisers.get(Constant.PREFIX_ID_SUPERVISER + id));
            } else if (role == Constant.ROLE_TYPE_BUSSINESS) {
                jsonObj.put("role", Constant.ROLE_TYPE_BUSSINESS);
                jsonObj.put("user", mockBusinesses.get(Constant.PREFIX_ID_BUSSINIESSMAN + id));
            } else if (role == Constant.ROLE_TYPE_CUSTOMER) {
                jsonObj.put("role", Constant.ROLE_TYPE_CUSTOMER);
                jsonObj.put("user", mockCustomers.get(Constant.PREFIX_ID_CUSTOMER + id));
            }
            return jsonObj;
        }
        JSONObject jsonObj = new JSONObject();
        if (role ==  Constant.ROLE_TYPE_SUPERVISER){
            Superviser sup = getSuperviserOnChain(id);
            jsonObj.put("role", Constant.ROLE_TYPE_SUPERVISER);
            jsonObj.put("user", sup);
        }else if (role == Constant.ROLE_TYPE_BUSSINESS){
            Business bus = getBussinessOnChain(id);
            jsonObj.put("role", Constant.ROLE_TYPE_BUSSINESS);
            jsonObj.put("user", bus);
        }else if (role == Constant.ROLE_TYPE_CUSTOMER){
            Customer cus = getCustomerOnChain(id);
            jsonObj.put("role", Constant.ROLE_TYPE_CUSTOMER);
            jsonObj.put("user", cus);
        }
        return jsonObj;
   
    }

    @Override
    public Boolean commodityCreate(String name, String price, String issuer, String issuerName) {
        if (mockEnabled) {
            Commodity commodity = new Commodity();
            String id = Constant.PREFIX_ID_COMMIDITY + System.currentTimeMillis();
            commodity.setId(id);
            commodity.setName(name);
            commodity.setPrice(price);
            commodity.setCurrency("0001");
            commodity.setIssuerId(issuer);
            commodity.setIssuerName(issuerName);
            commodity.setOwnerId(issuer);
            commodity.setOwnerName(issuerName);
            commodity.setLastUpdate(String.valueOf(System.currentTimeMillis()));
            commodity.setState(Constant.STATE_ON_SALE);
            mockCommodities.put(id, commodity);
            return true;
        }
        return mapper.createCommodity(name, price, issuer, issuerName);
    }

    @Override
    public List<Commodity> getCommodityOnSaleByIssuer(String issuer) {
        if (mockEnabled) {
            return mockCommodities.values().stream()
                    .filter(c -> issuer.equals(c.getIssuerId()))
                    .filter(c -> Constant.STATE_ON_SALE.equals(c.getState()))
                    .sorted(Comparator.comparing(Commodity::getLastUpdate).reversed())
                    .toList();
        }
        return mapper.getCommodityOnSaleByIssuer(issuer);
    }

    @Override
    public List<Commodity> getCommodityOnSale() {
        if (mockEnabled) {
            return mockCommodities.values().stream()
                    .filter(c -> Constant.STATE_ON_SALE.equals(c.getState()))
                    .sorted(Comparator.comparing(Commodity::getLastUpdate).reversed())
                    .toList();
        }
        return mapper.getCommodityOnSale();
    }

    @Override
    public Boolean createBuyTrade(String tTime, String price, String bId, String sId, String cId) {
        if (mockEnabled) {
            Commodity commodity = mockCommodities.get(cId);
            if (commodity == null) {
                return false;
            }
            Trade trade = new Trade();
            trade.setTradeId(Constant.PREFIX_ID_TRADE + tTime + (int) ((Math.random() * 9 + 1) * 1000));
            trade.setTradeTime(tTime);
            Calendar calendar = Calendar.getInstance();
            trade.setTradeDay(String.valueOf(calendar.get(Calendar.DAY_OF_MONTH)));
            trade.setTradeMonth(String.valueOf(calendar.get(Calendar.MONTH) + 1));
            trade.setTradeYear(String.valueOf(calendar.get(Calendar.YEAR)));
            trade.setPrice(Integer.parseInt(price));
            trade.setBuyerId(bId);
            trade.setSalerId(sId);
            trade.setValid(true);
            trade.setLastUpdateTime(String.valueOf(System.currentTimeMillis()));
            mockTrades.add(trade);
            commodity.setOwnerId(bId);
            commodity.setOwnerName(getUserNameById(bId));
            commodity.setState(Constant.STATE_BE_BAUGHT);
            commodity.setLastUpdate(String.valueOf(System.currentTimeMillis()));
            return true;
        }
        return mapper.createBuyTrade(tTime, price, bId, sId, cId);
    }

    @Override
    public List<Commodity> getCommodityBaughtByCus(String customer) {
        if (mockEnabled) {
            return mockCommodities.values().stream()
                    .filter(c -> customer.equals(c.getOwnerId()))
                    .filter(c -> Constant.STATE_BE_BAUGHT.equals(c.getState()))
                    .sorted(Comparator.comparing(Commodity::getLastUpdate).reversed())
                    .toList();
        }
        return mapper.getCommodityBaughtByCus(customer);
    }

    @Override
    public List<Commodity> getCommoditySaledByBus(String issuer) {
        if (mockEnabled) {
            return mockCommodities.values().stream()
                    .filter(c -> issuer.equals(c.getIssuerId()))
                    .filter(c -> Constant.STATE_BE_BAUGHT.equals(c.getState()))
                    .sorted(Comparator.comparing(Commodity::getLastUpdate).reversed())
                    .toList();
        }
        return mapper.getCommoditySaledByIssuer(issuer);
    }

    @Override
    public Business getBussinessOnChainById(String busId) {
        if (mockEnabled) {
            return mockBusinesses.get(busId);
        }
        return mapper.getBusinessById(busId);
    }

    @Override
    public Integer getBusProfitByMonth(String bId) {
        if (mockEnabled) {
            return mockTrades.stream()
                    .filter(Trade::getValid)
                    .filter(t -> bId.equals(t.getSalerId()))
                    .mapToInt(Trade::getPrice)
                    .sum();
        }
        return mapper.getBusProfitByMonth(bId);
    }

    @Override
    public List<Account> getUserAccountList(String Id) {
        if (mockEnabled) {
            return new ArrayList<>();
        }
        Calendar calendar = Calendar.getInstance();
        Integer year = calendar.get(Calendar.YEAR);
        Integer month = calendar.get(Calendar.MONTH) + 1;
        List<Account> res = new ArrayList<>();
        // 当月账单

        // 目前版本只允许返回当年近3个月的账单
        int Gap = 3;
        int count = 0;
        for(int i = month - 1;i > 0 && count < 3;i --, count ++){
            String monthstr = String.valueOf(month);
            String yearstr = String.valueOf(year);
            if (mapper.ExistAccountCheck(Id, monthstr, yearstr)){
                Account acc = mapper.getAccountByUserMonth(Id, monthstr, yearstr);
                res.add(acc);
            }
        }
        return res;

    }

    @Override
    public Customer getCustomerOnChianById(String cId) {
        if (mockEnabled) {
            return mockCustomers.get(cId);
        }
        return mapper.getCustomerById(cId);
    }

    @Override
    public Integer getCusSpentByMonth(String cId) {
        if (mockEnabled) {
            return mockTrades.stream()
                    .filter(Trade::getValid)
                    .filter(t -> cId.equals(t.getBuyerId()))
                    .mapToInt(Trade::getPrice)
                    .sum();
        }
        return mapper.getCusSpentByMonth(cId);
    }

    @Override
    public List<Business> getAllBusiness() {
        if (mockEnabled) {
            return new ArrayList<>(mockBusinesses.values());
        }
        return mapper.getAllBusiness();
    }

    @Override
    public List<Customer> getAllCustomer() {
        if (mockEnabled) {
            return new ArrayList<>(mockCustomers.values());
        }
        return mapper.getAllCustomers();
    }

    @Override
    public List<Commodity> getAllCommodity() {
        if (mockEnabled) {
            return new ArrayList<>(mockCommodities.values());
        }
        return mapper.getAllComodity();
    }

    @Override
    public List<Trade> getAllTrades() {
        if (mockEnabled) {
            return new ArrayList<>(mockTrades);
        }
        return mapper.getAllTrade();
    }

  

}
